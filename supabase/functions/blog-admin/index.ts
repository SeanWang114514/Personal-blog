import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import { parseDocument, stringify } from "npm:yaml@2.8.1";

const repo = "SeanWang114514/Personal-blog";
const branch = "main";
const origins = new Set(["https://seanwang114514.github.io", "http://127.0.0.1:4000", "http://localhost:4000"]);
const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function postPath(path: unknown): string {
  if (typeof path !== "string" || !/^_posts\/\d{4}-\d{2}-\d{2}-[\p{L}\p{N}_-]+\.(?:md|markdown)$/u.test(path)) {
    throw new Error("文章路径无效。");
  }
  return path;
}

export function parsePost(source: string) {
  if (typeof source !== "string" || encoder.encode(source).length > 512000) throw new Error("文章不能超过 500 KB。");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error("文章需要 YAML front matter。");
  const doc = parseDocument(match[1], { uniqueKeys: true });
  if (doc.errors.length) throw new Error("文章头部 YAML 格式有误。");
  const data = doc.toJS({ maxAliasCount: 0 });
  if (!data || typeof data !== "object" || Array.isArray(data) || data.layout !== "post" || typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("文章必须包含 layout: post 和标题。");
  }
  return { data, body: source.slice(match[0].length), document: doc };
}

function editorFields(data: Record<string, unknown>) {
  const date = data.date instanceof Date ? data.date.toISOString() : String(data.date || "");
  return {
    title: typeof data.title === "string" ? data.title : "",
    subtitle: typeof data.subtitle === "string" ? data.subtitle : "",
    date: date.replace("T", " ").slice(0, 16),
    categories: names(data.categories || data.category).join(", "),
    tags: names(data.tags).join(", "),
    headerImage: typeof data["header-img"] === "string" ? data["header-img"] : "",
    published: data.published !== false
  };
}

function splitNames(value: unknown, label: string): string[] {
  if (typeof value !== "string" || value.length > 1000) throw new Error(label + "格式无效。");
  const items = Array.from(new Set(value.split(/[，,]/).map(item => item.trim()).filter(Boolean)));
  if (items.length > 20 || items.some(item => item.length > 60 || /[\r\n]/.test(item))) throw new Error(label + "最多 20 项，每项不超过 60 个字符。");
  return items;
}

export function updatePost(source: string, fields: unknown, body: unknown): string {
  if (!fields || typeof fields !== "object" || Array.isArray(fields) || typeof body !== "string") throw new Error("文章内容无效。");
  const values = fields as Record<string, unknown>;
  const { document } = parsePost(source);
  const title = typeof values.title === "string" ? values.title.trim() : "";
  const subtitle = typeof values.subtitle === "string" ? values.subtitle.trim() : "";
  const date = typeof values.date === "string" ? values.date.trim().replace("T", " ") : "";
  const headerImage = typeof values.headerImage === "string" ? values.headerImage.trim() : "";
  const published = typeof values.published === "boolean" ? values.published : document.get("published") !== false;
  if (!title || title.length > 200 || /[\r\n]/.test(title)) throw new Error("标题需为 1 至 200 个字符。");
  if (subtitle.length > 300 || /[\r\n]/.test(subtitle)) throw new Error("副标题不能超过 300 个字符或包含换行。");
  if (!/^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error("请选择有效的发布时间。");
  if (headerImage.length > 1024 || /[\r\n]/.test(headerImage) || (headerImage && !safeCoverUrl(headerImage))) throw new Error("封面地址需为站内路径（如 img/preview/cover.svg）或 HTTPS 链接。");
  const categories = splitNames(values.categories, "分类");
  const tags = splitNames(values.tags, "标签");
  document.set("title", title);
  document.set("date", date);
  if (subtitle) document.set("subtitle", subtitle); else document.delete("subtitle");
  document.delete("category");
  document.delete("categories");
  if (categories.length === 1) document.set("category", categories[0]);
  if (categories.length > 1) document.set("categories", categories);
  document.set("tags", tags);
  if (headerImage) document.set("header-img", headerImage); else document.delete("header-img");
  if (published) document.delete("published"); else document.set("published", false);
  return "---\n" + document.toString({ lineWidth: 0 }).trimEnd() + "\n---\n" + body;
}

export function safeCoverUrl(value: string) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return /^https:\/\/[^\s<>"']+$/i.test(value);
  return !value.startsWith("//") && /^[A-Za-z0-9_./%~+-]+$/.test(value);
}

function safeAssetUrl(value: unknown, kind: "image" | "audio", storageOrigin: string): string {
  if (typeof value !== "string" || value.length > 2048 || /[\r\n]/.test(value)) throw new Error("资源地址无效。");
  let pathname = "";
  if (value.startsWith("/") && !value.startsWith("//") && !/[?#]/.test(value)) {
    if (value.split("/").some(part => part === "." || part === ".." || /%2f|%5c/i.test(part))) throw new Error("资源路径无效。");
    pathname = value;
    if (kind === "audio" ? !pathname.startsWith("/audio/") : !pathname.startsWith("/img/")) throw new Error("资源必须位于博客对应的媒体目录。");
  } else {
    let url: URL;
    try { url = new URL(value); } catch { throw new Error("资源地址无效。"); }
    if (url.origin !== storageOrigin || url.search || url.hash || !url.pathname.startsWith("/storage/v1/object/public/blog-assets/")) throw new Error("仅允许使用博客媒体桶中的 HTTPS 资源。");
    pathname = url.pathname;
    const parts = pathname.split("/");
    let decoded: string[];
    try { decoded = parts.map(part => decodeURIComponent(part)); } catch { throw new Error("资源路径无效。"); }
    if (decoded.some(part => part === "." || part === ".." || /[\\/]/.test(part))) throw new Error("资源路径无效。");
    if (kind === "audio" ? decoded[6] !== "audio" : decoded[6] !== "images") throw new Error("资源必须位于博客对应的媒体目录。");
  }
  const allowed = kind === "audio" ? /\.(?:mp3|m4a|ogg|wav)$/i : /\.(?:avif|webp|jpe?g|png)$/i;
  if (!allowed.test(pathname)) throw new Error(kind === "audio" ? "音乐仅支持 MP3、M4A、OGG 或 WAV。" : "图片仅支持 AVIF、WebP、JPG 或 PNG。");
  return value;
}

export function validateSiteSettings(input: unknown, storageOrigin: string) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("站点设置格式无效。");
  const settings = input as Record<string, unknown>;
  if (!Array.isArray(settings.wallpapers) || settings.wallpapers.length < 1 || settings.wallpapers.length > 20) throw new Error("请保留至少一张背景，最多可设置 20 张。");
  if (!Array.isArray(settings.playlist) || settings.playlist.length > 30) throw new Error("音乐集最多可设置 30 首歌曲。");
  const text = (value: unknown, label: string, max: number, required = true) => {
    if (typeof value !== "string" || value.length > max || /[\r\n]/.test(value) || (required && !value.trim())) throw new Error(label + "格式无效。");
    return value.trim();
  };
  const wallpapers = settings.wallpapers.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("背景第 " + (index + 1) + " 项无效。");
    const item = entry as Record<string, unknown>;
    const wallpaper: Record<string, string> = {
      name: text(item.name, "背景名称", 80),
      src: safeAssetUrl(item.src, "image", storageOrigin)
    };
    for (const key of ["mobile", "thumbnail"] as const) {
      if (item[key]) wallpaper[key] = safeAssetUrl(item[key], "image", storageOrigin);
    }
    if (item.position) {
      const position = text(item.position, "背景位置", 32);
      if (!/^(?:\d{1,3}%|left|center|right)\s+(?:\d{1,3}%|top|center|bottom)$/.test(position)) throw new Error("背景位置格式无效。");
      wallpaper.position = position;
    }
    return wallpaper;
  });
  const playlist = settings.playlist.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("音乐第 " + (index + 1) + " 项无效。");
    const item = entry as Record<string, unknown>;
    const track: Record<string, string> = {
      name: text(item.name, "歌曲名称", 120),
      artist: text(item.artist, "演唱者", 120, false),
      url: safeAssetUrl(item.url, "audio", storageOrigin)
    };
    if (item.cover) track.cover = safeAssetUrl(item.cover, "image", storageOrigin);
    return track;
  });
  return { wallpapers, playlist };
}

export function updateSiteConfig(source: string, settings: { wallpapers: unknown[]; playlist: unknown[] }): string {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length || !document.get("firefly")) throw new Error("站点配置无法安全读取。");
  document.setIn(["firefly", "wallpaper", "images"], settings.wallpapers);
  document.setIn(["firefly", "music", "playlist"], settings.playlist);
  document.setIn(["firefly", "music", "enable"], settings.playlist.length > 0);
  return document.toString();
}

function names(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.trim().split(/\s+/) : [];
  return Array.from(new Set(list.filter(x => typeof x === "string" && x.trim()).map(x => x.trim())));
}

export function changeTaxonomy(source: string, kind: string, from: string, to: string): string {
  if (kind !== "tags" && kind !== "categories") throw new Error("分类类型无效。");
  const { data, body } = parsePost(source);
  const keys = kind === "categories" ? ["category", "categories"] : ["tags"];
  let changed = false;
  for (const key of keys) {
    if (!names(data[key]).includes(from)) continue;
    const values = names(data[key]).flatMap(x => x === from ? to ? [to] : [] : [x]);
    if (key === "category" && values.length <= 1) {
      if (values.length) data[key] = values[0]; else delete data[key];
    } else data[key] = Array.from(new Set(values));
    changed = true;
  }
  return changed ? "---\n" + stringify(data) + "---\n" + body : source;
}

function from64(content: string) {
  return decoder.decode(Uint8Array.from(atob(content.replace(/\s/g, "")), c => c.charCodeAt(0)));
}
function to64(content: string) {
  let binary = "";
  for (const byte of encoder.encode(content)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function handle(request: Request): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  const cors: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", "Vary": "Origin" };
  if (origins.has(origin)) cors["Access-Control-Allow-Origin"] = origin;
  cors["Access-Control-Allow-Headers"] = "authorization, apikey, content-type, x-client-info";
  cors["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
  if (origin && !origins.has(origin)) return reply({ error: "不允许此来源。" }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return reply({ error: "仅接受 POST。" }, 405);
  const authorization = request.headers.get("Authorization") || "";
  if (!/^Bearer \S+$/.test(authorization)) return reply({ error: "请先登录。" }, 401);
  try {
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authorization } }, auth: { persistSession: false }
    });
    const user = await client.auth.getUser(authorization.slice(7));
    if (user.error || !user.data.user) return reply({ error: "登录已过期，请重新登录。" }, 401);
    const role = await client.rpc("blog_is_admin");
    if (role.error || role.data !== true) return reply({ error: "只有管理员可以执行此操作。" }, 403);
    if (Number(request.headers.get("Content-Length")) > 1000000) return reply({ error: "请求过大。" }, 413);
    const raw = await request.text();
    if (encoder.encode(raw).length > 1000000) return reply({ error: "请求过大。" }, 413);
    const input = JSON.parse(raw);
    const token = Deno.env.get("GITHUB_CONTENT_TOKEN");
    if (!token) return reply({ error: "文章发布服务尚未配置仓库凭据。" }, 503);
    async function github(path: string, method = "GET", body?: unknown): Promise<any> {
      const response = await fetch("https://api.github.com/repos/" + repo + path, {
        method, headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      if (response.status === 404 && method === "GET") return null;
      if (!response.ok) {
        if (response.status === 409 || response.status === 422) throw new Error("仓库内容已变化或文件已存在，请刷新后重试。");
        throw new Error("仓库请求失败（" + response.status + "），请检查发布凭据权限。");
      }
      return response.status === 204 ? null : response.json();
    }
    const encoded = (path: string) => path.split("/").map(encodeURIComponent).join("/");
    const readFile = (path: string) => github("/contents/" + encoded(path) + "?ref=" + branch);
    async function allPosts() {
      const files = await readFile("_posts");
      if (!Array.isArray(files) || files.length > 500) throw new Error("文章目录无法读取或超过本后台的 500 篇限制。");
      const result = [];
      for (const file of files) {
        if (file.type !== "file" || !/\.(md|markdown)$/.test(file.name)) continue;
        postPath(file.path);
        const full = await readFile(file.path);
        const source = from64(full.content);
        const parsed = parsePost(source);
      result.push({ path: file.path, sha: full.sha, source, title: parsed.data.title, date: String(parsed.data.date || file.name.slice(0, 10)), categories: names(parsed.data.categories || parsed.data.category), tags: names(parsed.data.tags), published: parsed.data.published !== false });
      }
      return result;
    }
    if (input.action === "list") {
      const posts = await allPosts();
      const taxonomyFile = await readFile("_data/blog-taxonomy.yml");
      const taxonomy = taxonomyFile ? parseDocument(from64(taxonomyFile.content)).toJS({ maxAliasCount: 0 }) || {} : {};
      const siteFile = await readFile("_config.yml");
      const siteConfig = siteFile ? parseDocument(from64(siteFile.content), { uniqueKeys: true }).toJS({ maxAliasCount: 0 }) : {};
      return reply({
        posts: posts.sort((a, b) => b.date.localeCompare(a.date)),
        taxonomy: { tags: Array.from(new Set([...names(taxonomy.tags), ...posts.flatMap(p => p.tags)])), categories: Array.from(new Set([...names(taxonomy.categories), ...posts.flatMap(p => p.categories)])) },
        settings: { wallpapers: siteConfig.firefly?.wallpaper?.images || [], playlist: siteConfig.firefly?.music?.playlist || [] }
      });
    }
    if (input.action === "read") {
      const path = postPath(input.path);
      const file = await readFile(path);
      if (!file) return reply({ error: "文章已不存在，请刷新列表。" }, 404);
      const source = from64(file.content);
      const parsed = parsePost(source);
      const filename = path.split("/").pop() || "";
      return reply({ post: { path, sha: file.sha, source, title: parsed.data.title, date: String(parsed.data.date || filename.slice(0, 10)), categories: names(parsed.data.categories || parsed.data.category), tags: names(parsed.data.tags), fields: editorFields(parsed.data), body: parsed.body, published: parsed.data.published !== false } });
    }
    if (input.action === "parse") {
      const parsed = parsePost(input.source);
      return reply({ source: input.source, fields: editorFields(parsed.data), body: parsed.body });
    }
    if (input.action === "export") {
      const source = updatePost(input.source, input.fields, input.body);
      return reply({ source });
    }
    if (input.action === "save") {
      const path = postPath(input.path);
      const source = input.fields || typeof input.body === "string" ? updatePost(input.source, input.fields, input.body) : input.source;
      const savedPost = parsePost(source);
      if (input.sha && !/^[a-f0-9]{40}$/.test(input.sha)) throw new Error("文件版本无效。");
      const isDraft = savedPost.data.published === false;
      const result = await github("/contents/" + encoded(path), "PUT", { message: "blog: " + (isDraft ? "save draft " : input.sha ? "update " : "publish ") + path.split("/").pop(), content: to64(source), branch, ...(input.sha ? { sha: input.sha } : {}) });
      return reply({ sha: result.content.sha, source, url: result.commit.html_url, message: isDraft ? "草稿已保存到仓库，不会出现在公开文章列表。" : "文章已提交，GitHub Actions 将自动构建并发布。" });
    }
    if (input.action === "site-settings") {
      const settings = validateSiteSettings(input.settings, new URL(Deno.env.get("SUPABASE_URL")!).origin);
      const config = await readFile("_config.yml");
      if (!config || !/^[a-f0-9]{40}$/.test(config.sha || "")) throw new Error("无法读取站点配置，请稍后重试。");
      const source = updateSiteConfig(from64(config.content), settings);
      const result = await github("/contents/_config.yml", "PUT", {
        message: "blog: update wallpaper and music settings",
        content: to64(source),
        branch,
        sha: config.sha
      });
      return reply({ sha: result.content.sha, url: result.commit.html_url, message: "背景与音乐设置已提交，网站将在构建完成后更新。" });
    }
    if (input.action === "delete") {
      const path = postPath(input.path);
      if (!/^[a-f0-9]{40}$/.test(input.sha || "")) throw new Error("请先读取文章的最新版本。");
      await github("/contents/" + encoded(path), "DELETE", { message: "blog: remove " + path.split("/").pop(), sha: input.sha, branch });
      return reply({ message: "文章已从仓库移除，等待重新发布。" });
    }
    if (input.action === "taxonomy") {
      if (!["tags", "categories"].includes(input.kind)) throw new Error("分类类型无效。");
      const from = typeof input.from === "string" ? input.from.trim() : "";
      const to = typeof input.to === "string" ? input.to.trim() : "";
      if ((!from && !to) || from.length > 60 || to.length > 60 || /[\r\n]/.test(from + to)) throw new Error("名称需为 1 至 60 个字符。");
      const ref = await github("/git/ref/heads/" + branch);
      const parent = await github("/git/commits/" + ref.object.sha);
      const posts = from ? await allPosts() : [];
      const registryFile = await readFile("_data/blog-taxonomy.yml");
      const registry = registryFile ? parseDocument(from64(registryFile.content)).toJS({ maxAliasCount: 0 }) || {} : {};
      registry[input.kind] = Array.from(new Set([...names(registry[input.kind]).filter(x => x !== from), ...(to ? [to] : [])]));
      const tree = [{ path: "_data/blog-taxonomy.yml", mode: "100644", type: "blob", content: stringify(registry) }];
      for (const post of posts) {
        const next = changeTaxonomy(post.source, input.kind, from, to);
        if (next !== post.source) tree.push({ path: post.path, mode: "100644", type: "blob", content: next });
      }
      const createdTree = await github("/git/trees", "POST", { base_tree: parent.tree.sha, tree });
      const commit = await github("/git/commits", "POST", { message: "blog: update " + input.kind, tree: createdTree.sha, parents: [ref.object.sha] });
      await github("/git/refs/heads/" + branch, "PATCH", { sha: commit.sha, force: false });
      return reply({ message: "分类已更新，相关的文章将在同一次构建中发布。", url: commit.html_url });
    }
    return reply({ error: "未知操作。" }, 400);
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "操作失败。" }, 400);
  }
}

export default { fetch: handle };
