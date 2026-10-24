import { changeTaxonomy, handle, listMoments, parsePost, postPath, removeMoment, updatePost, validateMoment, writeMoment } from "../supabase/functions/blog-admin/index.ts";

function assert(value: unknown, message = "assertion failed") { if (!value) throw new Error(message); }
function rejects(work: () => unknown) { let failed = false; try { work(); } catch { failed = true; } assert(failed); }
const article = "---\nlayout: post\ntitle: 测试文章\ncategory: 工具\ntags: [Rime, Lua]\ncustom: keep\n---\n\n正文 **Markdown**\n";

Deno.test("post write scope excludes traversal, workflows and nested paths", () => {
  assert(postPath("_posts/2026-10-18-test.markdown") === "_posts/2026-10-18-test.markdown");
  for (const path of ["_config.yml", ".github/workflows/deploy.yml", "_posts/../_config.yml", "_posts/folder/2026-10-18-test.md", "_posts/2026-10-18-test.md/../../x", "_posts/2026-10-18-test.svg"]) rejects(() => postPath(path));
});
Deno.test("front matter is parsed with YAML, validates titles and rejects alias bombs", () => {
  assert(parsePost(article).data.title === "测试文章");
  rejects(() => parsePost("# no front matter"));
  rejects(() => parsePost("---\nlayout: default\ntitle: nope\n---\ntext"));
  rejects(() => parsePost("---\nlayout: post\ntitle: first\ntitle: second\n---\ntext"));
  rejects(() => parsePost("---\nlayout: post\ntitle: valid\nx: &a [1, 2]\ny: *a\n---\ntext"));
  rejects(() => parsePost("x".repeat(512001)));
});
Deno.test("article editor preserves an intentionally empty body and updates metadata", () => {
  const updated = updatePost(article, { title: "编辑后的标题", subtitle: "副标题", date: "2026-10-20 12:30", categories: "工具, 编辑", tags: "Markdown, 博客", headerImage: "/img/cover.webp" }, "");
  const parsed = parsePost(updated);
  assert(parsed.data.title === "编辑后的标题");
  assert(parsed.data.subtitle === "副标题");
  assert(parsed.data.category === undefined);
  assert(parsed.data.categories.join(",") === "工具,编辑");
  assert(parsed.data.tags.join(",") === "Markdown,博客");
  assert(parsed.data["header-img"] === "/img/cover.webp");
  assert(parsed.body === "");
});
Deno.test("article editor persists draft state and can publish it again", () => {
  const draft = updatePost(article, { title: "草稿", date: "2026-10-20 12:30", categories: "", tags: "", headerImage: "", published: false }, "draft body");
  assert(parsePost(draft).data.published === false);
  const published = updatePost(draft, { title: "草稿", date: "2026-10-20 12:30", categories: "", tags: "", headerImage: "", published: true }, "draft body");
  assert(parsePost(published).data.published === undefined);
  const preserved = updatePost(draft, { title: "草稿", date: "2026-10-20 12:30", categories: "", tags: "", headerImage: "" }, "draft body");
  assert(parsePost(preserved).data.published === false);
});
Deno.test("taxonomy updates preserve unrelated metadata and article body", () => {
  const changed = changeTaxonomy(article, "tags", "Rime", "输入法");
  const parsed = parsePost(changed);
  assert(parsed.data.tags.includes("输入法") && parsed.data.tags.includes("Lua"));
  assert(parsed.data.custom === "keep");
  assert(parsed.body === parsePost(article).body);
  assert(changeTaxonomy(article, "tags", "missing", "other") === article);
  assert(!parsePost(changeTaxonomy(article, "categories", "工具", "")).data.category);
  rejects(() => changeTaxonomy(article, "paths", "x", "y"));
});
Deno.test("untrusted origins and missing authorization are rejected before any service call", async () => {
  const blocked = await handle(new Request("http://edge.test", { method: "POST", headers: { Origin: "https://evil.example" }, body: "{}" }));
  assert(blocked.status === 403);
  const missing = await handle(new Request("http://edge.test", { method: "POST", body: "{}" }));
  assert(missing.status === 401);
  const preflight = await handle(new Request("http://edge.test", { method: "OPTIONS", headers: { Origin: "http://127.0.0.1:4000" } }));
  assert(preflight.status === 204);
  assert(preflight.headers.get("Access-Control-Allow-Origin") === "http://127.0.0.1:4000");
});
Deno.test("verified ordinary users cannot reach GitHub even when claiming admin in request JSON", async () => {
  Deno.env.set("SUPABASE_URL", "https://example.supabase.co");
  Deno.env.set("SUPABASE_ANON_KEY", "test-key");
  Deno.env.set("GITHUB_CONTENT_TOKEN", "test-server-only");
  const originalFetch = globalThis.fetch;
  let githubCalls = 0;
  globalThis.fetch = (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("api.github.com")) { githubCalls++; throw new Error("must not contact GitHub"); }
    return Promise.resolve(new Response(JSON.stringify(url.includes("/auth/v1/user")
      ? { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: { role: "admin" } }
      : false), { status: 200, headers: { "Content-Type": "application/json" } }));
  };
  try {
    const response = await handle(new Request("http://edge.test", { method: "POST", headers: { Authorization: "Bearer real-looking-session" }, body: JSON.stringify({ action: "delete", role: "admin", path: "_posts/2026-10-18-test.md", sha: "a".repeat(40) }) }));
    assert(response.status === 403);
    assert(githubCalls === 0);
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test("expired sessions are rejected before checking the admin role or GitHub", async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = () => {
    requests++;
    return Promise.resolve(new Response(JSON.stringify({ message: "JWT expired" }), { status: 401, headers: { "Content-Type": "application/json" } }));
  };
  try {
    const response = await handle(new Request("http://edge.test", { method: "POST", headers: { Authorization: "Bearer expired-session" }, body: '{"action":"list"}' }));
    assert(response.status === 401);
    assert(requests === 1);
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test("reading a published post returns its complete Markdown and editor metadata", async () => {
  const originalFetch = globalThis.fetch;
  const encoded = btoa(Array.from(new TextEncoder().encode(article), byte => String.fromCharCode(byte)).join(""));
  globalThis.fetch = (input: string | URL | Request) => {
    const url = String(input);
    let data: unknown = true;
    if (url.includes("/auth/v1/user")) data = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {} };
    else if (url.includes("api.github.com")) data = { type: "file", name: "2026-10-18-test.markdown", sha: "b".repeat(40), content: encoded };
    return Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } }));
  };
  Deno.env.set("SUPABASE_URL", "https://example.supabase.co");
  Deno.env.set("SUPABASE_ANON_KEY", "test-key");
  Deno.env.set("GITHUB_CONTENT_TOKEN", "test-server-only");
  try {
    const response = await handle(new Request("http://edge.test", { method: "POST", headers: { Authorization: "Bearer verified-session" }, body: JSON.stringify({ action: "read", path: "_posts/2026-10-18-test.markdown" }) }));
    assert(response.status === 200);
    const result = await response.json();
    assert(result.post.path === "_posts/2026-10-18-test.markdown");
    assert(result.post.source === article);
    assert(result.post.body === "\n正文 **Markdown**\n");
    assert(result.post.fields.title === "测试文章");
    assert(result.post.published === true);
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test("verified admins publish only the validated article path with optimistic concurrency", async () => {
  const originalFetch = globalThis.fetch;
  const githubCalls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    let data: unknown = true;
    if (url.includes("/auth/v1/user")) data = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {} };
    else if (url.includes("api.github.com")) { githubCalls.push({ url, init }); data = { content: { sha: "b".repeat(40) }, commit: { html_url: "https://github.com/SeanWang114514/Personal-blog/commit/test" } }; }
    return Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } }));
  };
  const request = (path: string, fields?: Record<string, unknown>) => new Request("http://edge.test", { method: "POST", headers: { Authorization: "Bearer verified-session" }, body: JSON.stringify({ action: "save", path, source: article, sha: "a".repeat(40), ...(fields ? { fields, body: "draft body" } : {}) }) });
  try {
    assert((await handle(request(".github/workflows/run.yml"))).status === 400);
    assert(githubCalls.length === 0);
    const response = await handle(request("_posts/2026-10-18-test.md"));
    assert(response.status === 200);
    assert(githubCalls.length === 1);
    assert(githubCalls[0].url === "https://api.github.com/repos/SeanWang114514/Personal-blog/contents/_posts/2026-10-18-test.md");
    assert(githubCalls[0].init?.method === "PUT");
    const submitted = JSON.parse(String(githubCalls[0].init?.body));
    assert(submitted.sha === "a".repeat(40) && submitted.branch === "main");
    assert(new TextDecoder().decode(Uint8Array.from(atob(submitted.content), c => c.charCodeAt(0))) === article);
    const draft = await handle(request("_posts/2026-10-18-test.md", { title: "测试草稿", date: "2026-10-18 08:00", categories: "", tags: "", headerImage: "", published: false }));
    assert(draft.status === 200);
    assert((await draft.json()).message === "草稿已保存到仓库，不会出现在公开文章列表。");
    assert(githubCalls.length === 2);
    const draftCommit = JSON.parse(String(githubCalls[1].init?.body));
    assert(draftCommit.message.includes("save draft"));
    assert(atob(draftCommit.content).includes("published: false"));
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test("cover paths accept the site-relative artwork every published post uses", () => {
  const base = { title: "封面测试", date: "2026-10-20 12:30", categories: "", tags: "" };
  const relative = updatePost(article, { ...base, headerImage: "img/preview/note-studio.svg" }, "正文");
  assert(parsePost(relative).data["header-img"] === "img/preview/note-studio.svg");
  assert(parsePost(relative).data.custom === "keep");
  const rooted = updatePost(article, { ...base, headerImage: "/img/preview/note-studio.svg" }, "正文");
  assert(parsePost(rooted).data["header-img"] === "/img/preview/note-studio.svg");
  const remote = updatePost(article, { ...base, headerImage: "https://cdn.example.com/a.webp" }, "正文");
  assert(parsePost(remote).data["header-img"] === "https://cdn.example.com/a.webp");
  for (const bad of ["javascript:alert(1)", "data:image/svg+xml;base64,AA", "//evil.example/a.svg", "ftp://evil.example/a.svg", "img cover.svg", "img\\cover.svg"]) {
    rejects(() => updatePost(article, { ...base, headerImage: bad }, "正文"));
  }
});
Deno.test("a post classified with the singular category key keeps that classification when edited", () => {
  const source = "---\nlayout: post\ntitle: 单数分类\ncategory: 输入法\ntags: [Rime]\n---\n\n正文\n";
  const edited = updatePost(source, { title: "单数分类", date: "2026-10-20 12:30", categories: "输入法", tags: "Rime", headerImage: "" }, parsePost(source).body);
  assert(parsePost(edited).data.category === "输入法");
  assert(parsePost(edited).data.categories === undefined);
  const cleared = updatePost(source, { title: "单数分类", date: "2026-10-20 12:30", categories: "", tags: "Rime", headerImage: "" }, parsePost(source).body);
  assert(parsePost(cleared).data.category === undefined);
});
const momentsFile = [
  "# ===== 碎碎念 =====",
  "# 字段：date / content / tags / pinned",
  "",
  "- date: 2026-10-11",
  "  content: >-",
  "    第一段说明",
  "    第二段",
  "  tags: [建站]",
  "  pinned: true",
  "",
  "- date: 2026-10-05",
  "  content: >-",
  "    只有一句。",
  "  tags: [性能]",
  "",
  "- date: 2026-09-28",
  "  content: >-",
  "    带配图的一条。",
  "  images: [img/moment/a.webp, img/moment/b.webp]",
  "  location: 杭州",
  ""
].join("\n");
const momentValues = { date: "2026-10-25", content: "今天把碎碎念的后台写完了。", tags: ["建站", "后台"], location: "", pinned: false };

Deno.test("moments file is read into ordered entries without touching existing bytes", () => {
  const entries = listMoments(momentsFile);
  assert(entries.length === 3);
  assert(entries[0].date === "2026-10-11" && entries[0].pinned === true && entries[0].tags.join(",") === "建站");
  assert(entries[0].content === "第一段说明 第二段");
  assert(entries[2].location === "杭州");
  const inserted = writeMoment(momentsFile, null, momentValues);
  assert(inserted.startsWith("# ===== 碎碎念 =====\n# 字段：date / content / tags / pinned\n\n- date: 2026-10-25\n  content: 今天把碎碎念的后台写完了。\n  tags:\n    - 建站\n    - 后台\n\n- date: 2026-10-11"));
  assert(inserted.slice(inserted.indexOf("- date: 2026-10-11")) === momentsFile.slice(momentsFile.indexOf("- date: 2026-10-11")));
  assert(listMoments(inserted).length === 4 && listMoments(inserted)[1].pinned === true);
});
Deno.test("editing and deleting one moment leaves the other entries untouched", () => {
  const edited = writeMoment(momentsFile, 1, { ...momentValues, date: "2026-10-05", content: "改过的第二段" });
  assert(edited.slice(0, edited.indexOf("- date: 2026-10-05")) === momentsFile.slice(0, momentsFile.indexOf("- date: 2026-10-05")));
  assert(edited.slice(edited.indexOf("- date: 2026-09-28")) === momentsFile.slice(momentsFile.indexOf("- date: 2026-09-28")));
  const entries = listMoments(edited);
  assert(entries.length === 3 && entries[1].content === "改过的第二段" && entries[1].tags.join(",") === "建站,后台");
  const kept = listMoments(writeMoment(momentsFile, 2, momentValues));
  assert(kept[2].pinned === false && kept[2].tags.length === 2 && kept[2].location === "");
  const stillImaged = writeMoment(momentsFile, 2, { ...momentValues, content: "换一句话", location: "杭州" });
  assert(stillImaged.includes("images:") && stillImaged.includes("- img/moment/a.webp") && stillImaged.includes("- img/moment/b.webp"));
  assert(stillImaged.includes("location: 杭州"));
  const removed = removeMoment(momentsFile, 1);
  assert(removed.slice(0, removed.indexOf("- date: 2026-10-11")) === momentsFile.slice(0, momentsFile.indexOf("- date: 2026-10-11")));
  assert(removed.slice(removed.indexOf("- date: 2026-09-28")) === momentsFile.slice(momentsFile.indexOf("- date: 2026-09-28")));
  assert(listMoments(removed).length === 2 && listMoments(removed)[1].date === "2026-09-28");
  const onlyOne = removeMoment(removeMoment(momentsFile, 1), 1);
  assert(listMoments(onlyOne).length === 1 && onlyOne.startsWith("# ===== 碎碎念 ====="));
  rejects(() => writeMoment(momentsFile, 9, momentValues));
  rejects(() => removeMoment(momentsFile, 9));
});
Deno.test("moment input is validated before it reaches the repository", () => {
  const values = validateMoment({ date: " 2026-10-25 ", content: " 一句话 \r\n第二行 ", tags: "建站, 后台", pinned: true });
  assert(values.date === "2026-10-25" && values.content === "一句话 \n第二行" && values.tags.join(",") === "建站,后台" && values.pinned === true);
  assert(validateMoment({ date: "2026-10-25", content: "一句话" }).pinned === false);
  for (const bad of [{ date: "2026-13-40", content: "x" }, { date: "2026/10/25", content: "x" }, { date: "2026-10-25", content: "   " }, { date: "2026-10-25", content: "x".repeat(2001) }, { date: "2026-10-25", content: "x", tags: ["a", "b", "c", "d", "e", "f"] }, { date: "2026-10-25", content: "x", tags: ["x".repeat(25)] }, { date: "2026-10-25", content: "x", location: "y".repeat(61) }]) rejects(() => validateMoment(bad as Record<string, unknown>));
});
Deno.test("a missing moments file is created as a valid list under its header comments", () => {
  const template = "# 碎碎念：一句话式的短记录。\n";
  const created = writeMoment(template, null, momentValues);
  assert(created === "# 碎碎念：一句话式的短记录。\n\n- date: 2026-10-25\n  content: 今天把碎碎念的后台写完了。\n  tags:\n    - 建站\n    - 后台\n");
  assert(listMoments(created).length === 1);
  const multiline = writeMoment(created, null, { ...momentValues, content: "第一段\n\n第二段" });
  assert(listMoments(multiline)[0].content === "第一段\n\n第二段");
});
Deno.test("admins add, edit and remove moments with optimistic concurrency", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  let missing = false;
  const file64 = btoa(Array.from(new TextEncoder().encode(momentsFile), byte => String.fromCharCode(byte)).join(""));
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    let data: unknown = true;
    if (url.includes("/auth/v1/user")) data = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {} };
    else if (url.includes("api.github.com")) {
      calls.push({ url, init });
      if (init?.method === "PUT") return Promise.resolve(new Response(JSON.stringify({ content: { sha: "d".repeat(40) }, commit: { html_url: "https://github.com/SeanWang114514/Personal-blog/commit/moment" } }), { status: 200, headers: { "Content-Type": "application/json" } }));
      if (missing) return Promise.resolve(new Response(JSON.stringify({ message: "Not Found" }), { status: 404, headers: { "Content-Type": "application/json" } }));
      data = { sha: "c".repeat(40), content: file64 };
    }
    return Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } }));
  };
  const send = (body: Record<string, unknown>) => handle(new Request("http://edge.test", { method: "POST", headers: { Authorization: "Bearer verified-session" }, body: JSON.stringify(body) }));
  const moment = { date: "2026-10-25", content: "今天把碎碎念的后台写完了。", tags: ["建站"] };
  try {
    const listed = await (await send({ action: "moments" })).json();
    assert(listed.exists === true && listed.entries.length === 3 && listed.sha === "c".repeat(40));
    const dry = await (await send({ action: "save-moment", dryRun: true, index: null, ...moment })).json();
    assert(calls.length === 2 && dry.source.startsWith("# ===== 碎碎念 =====\n# 字段：date / content / tags / pinned\n\n- date: 2026-10-25"));
    assert(dry.source.indexOf("- date: 2026-10-25") < dry.source.indexOf("- date: 2026-10-11"));
    assert((await send({ action: "save-moment", sha: "e".repeat(40), index: null, ...moment })).status === 400);
    const created = await send({ action: "save-moment", sha: "c".repeat(40), index: null, ...moment });
    assert(created.status === 200);
    assert((await created.json()).message.includes("碎碎念已提交"));
    const put = calls[calls.length - 1];
    assert(put.url.includes("/contents/_data/moments.yml") && put.init?.method === "PUT");
    const body = JSON.parse(String(put.init?.body));
    assert(body.sha === "c".repeat(40) && body.branch === "main" && body.message === "blog: add moment 2026-10-25");
    const source = new TextDecoder().decode(Uint8Array.from(atob(body.content), c => c.charCodeAt(0)));
    assert(listMoments(source).length === 4);
    const edited = await send({ action: "save-moment", sha: "c".repeat(40), index: 1, ...moment, content: "改过的第二段" });
    assert(edited.status === 200);
    const editedSource = new TextDecoder().decode(Uint8Array.from(atob(JSON.parse(String(calls[calls.length - 1].init?.body)).content), c => c.charCodeAt(0)));
    assert(listMoments(editedSource)[1].content === "改过的第二段");
    const removed = await send({ action: "delete-moment", sha: "c".repeat(40), index: 0 });
    assert(removed.status === 200);
    const removedBody = JSON.parse(String(calls[calls.length - 1].init?.body));
    assert(removedBody.message === "blog: remove moment" && listMoments(new TextDecoder().decode(Uint8Array.from(atob(removedBody.content), c => c.charCodeAt(0)))).length === 2);
  } finally { globalThis.fetch = originalFetch; }
});
