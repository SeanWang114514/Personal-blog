# 下个 Agent 任务清单

更新时间：2026-10-24（浏览器端验证 + Markdown 往返缺陷 D1–D6 修复完成，仅剩线上部署）

## 已完成

- [x] 已发布文章按需读取接口已写入 `supabase/functions/blog-admin/index.ts`。
- [x] 管理后台使用单栏、宽幅所见即所得正文编辑器，保留 Markdown 源码切换；对应代码在 `admin.html`、`js/admin.js`、`css/community.css`。
- [x] `node --check`：`js/admin.js`、`js/community.js`、`js/sw.js` 通过。
- [x] `node --test _tests/content-motion.test.cjs _tests/github-auth.test.cjs`：13 项通过。
- [x] `npm exec --yes --package=deno -- deno check supabase/functions/blog-admin/index.ts` 通过（隔离 `DENO_DIR` 全量复跑 0 诊断，阴性对照正确报错）。
- [x] `npm exec --yes --package=deno -- deno test --allow-env _tests/admin-edge.test.ts`：10 项通过。
- `bundle exec jekyll build --config _config.yml`：exit 0（0.902s，0 warning / 0 error）。
- [x] 本地浏览器读取到管理员身份和 6 篇已发布文章；点击文章后，线上函数回复“未知操作”（已复现：`HTTP 400 {"error":"未知操作。"}`）。
- [x] 用真实管理员会话验证了新建草稿、6 个元数据字段、正文写入与脏标记、发布态切换（草稿/已发布文案与提示联动）、未保存离开 confirm（取消保留、确认回列表）。
- [x] 用真实文章做了 Markdown ↔ 所见即所得往返：表格、代码围栏、`<!--more-->`、`<details>` 自定义 HTML 块、内联 `<svg>` 均保留（`exactEqual=true`）。
- [x] 桌面/手机视口检查：1920/1440/1280/1024/768/430/390 全部无页面级横向滚动；移动端工具栏折 2 行、按钮最小 36×36、保存按钮滚动可达。
- [x] 冲突提示验证（mock 409）：状态栏显示“仓库内容已变化或文件已存在，请刷新后重试。”，编辑器不关闭、正文与脏标记保留。

## 缺陷（D1–D6 已在本轮修复并回归验证）

- [x] **D1 块引用内行内格式被静默丢弃**：blockquote 渲染改为合并连续 `>` 行成单个 `<blockquote>`（空 `>` 行分段），序列化不再用 `element.innerText`，改为逐子节点还原（文本节点→escapeMarkdown、`p`/`div`/`h1-6`→serializeInline、其它→serializeBlock），每行加 `> ` 前缀、空行输出 `>`。
- [x] **D2 加粗包住含 `*` 的行内代码时被解析错并转义**：code span 先抽成 `\uE000<n>\uE001` 占位符，强调解析完成后再还原；bold/删除线改用非贪婪 `[\s\S]+?`。
- [x] **D3 嵌套列表被拍平**：`listStack` 按缩进维护层级（tab 记 2 空格），支持嵌套、同级续写与列表类型切换。
- [x] **D4 表单校验静默失败**（原「建议」项）：捕获阶段监听 `invalid`，写状态栏「请先补全“X”再保存。」（`datetime-local` 追加时间格式示例），字段加 `aria-invalid="true"` 与红色边框，输入时移除。
- [x] **D5 `http://` 链接被静默丢弃**：`safeUrl` 由 `/^https:\/\//` 放宽为 `/^https?:\/\//i`（`javascript:`、`data:` 仍拒绝）。真实命中 `_posts/2026-09-05-ppocrv6-desktop.markdown:326` 的 Clipper2 链接。
- [x] **D6 下划线被过度转义**：`escapeMarkdown` 不再转义 `_`，避免 `PP-OCRv5_mobile` 被写成 `PP-OCRv5\_mobile`。
- [x] **D7 保存后正文尾部换行丢失**：`richHtmlToMarkdown` 末尾 `trim()` 去掉了仓库文件本来就有的结尾换行，每次保存都产生末尾空行 diff；改为 `.replace(/\n+$/, "") + "\n"`。

## Markdown 往返回归数据（修复后实测）

- 单元素夹具 9 例（引用块、多段引用、加粗含通配符 code、嵌套无序/有序列表、含 code 表格、自定义 HTML 块、XSS 行内脚本、普通强调）：**8/9 完全 EXACT**；唯一差异是 3 空格缩进的有序嵌套列表归一化为 2 空格（等价 Markdown，非缺陷）。9 例富文本区 `script` 节点均为 0。
- 真实文章正文（剥离 front matter、CRLF 归一后与仓库原文件逐行比对，忽略空行与表格分隔行宽度）：
  - `_posts/2026-09-30-weasel-vmenu-suite.markdown`（176 行有效内容 / 15546 字符）：**逐行完全一致**。
  - `_posts/2026-09-19-note-studio.markdown`（367 行有效内容 / 30070 字符）：**逐行完全一致**。
  - `_posts/2026-09-05-ppocrv6-desktop.markdown`（264 行有效内容 / 19880 字符）：**逐行完全一致**。
  - 仍存在的格式差异（渲染等价）：①原始 HTML 块（如 `<p style=...>` 图注）前后的空行位置会重排；②表格分隔行 `|------|------|` 归一化为 `| --- | --- |`；③正文末尾统一为单个换行——本轮已把序列化尾部的 `trim()` 改为 `.replace(/\n+$/, "") + "\n"`，与仓库文件尾部一致。
  - 结论：文字、代码、表格、引用、列表、自定义 HTML/SVG 块零丢失；保存只会产生空白行与分隔行宽度的格式 diff。

## 真实文章进入编辑器（拦截 read 的本地验证）

用 `Page.addScriptToEvaluateOnNewDocument` 拦截 `blog-admin` 的 `list`/`read`，返回 `_posts/2026-09-19-note-studio.markdown` 的真实 Markdown（30070 字符），点击列表项后实测：

- 状态栏：“已载入《Note Studio：把 PDF 改字、OCR 和语音识别装进一个本地工作台》，正文共 30070 个字符。”；标题与日期字段与仓库一致；编辑器打开且未隐藏。
- 富文本结构：`h2`×10、`h3`×9、`table`×3（20 行）、`blockquote`×1、`pre`×1、`code`×33、`ul`×9、`ol`×2、`a`×17、`script`×0。
- 溢出：1440 宽下富文本区 `scrollWidth === clientWidth === 1150`；390 宽下 `356 === 356`，页面 `scrollWidth === innerWidth === 390`，无横向滚动。
- 只有 `list`、`read` 两次请求被发出，没有触发 `save`/`publish`（生产内容未被改动）。

## 合并顺序（重要）

本分支的 `admin.html` 用 `layout: default`，所需样式与脚本由未提交的整站改造注入：`_includes/head.html:67`（`community.css`）与 `_includes/footer.html:113`（`page.url == '/admin/'` 时加载 `js/admin.js`）。分支 HEAD 里这两行不存在，**单独检出并合并时 `/admin/` 页面没有样式和脚本**。

因此正确顺序是：先合并/上传整站改造（含上述两处接线），再合并本分支的编辑器文件；或在本分支另加一个极小的接线提交。不要先合并本分支再指望后台可用。

## 本轮追加的自动化复跑（修复后）

- `node --check js/admin.js` 通过。
- `node --test _tests/content-motion.test.cjs _tests/github-auth.test.cjs`：13 项通过（136ms）。
- `npm exec --yes --package=deno -- deno check supabase/functions/blog-admin/index.ts`：0 诊断。
- `npm exec --yes --package=deno -- deno test --allow-env _tests/admin-edge.test.ts`：10 项通过（48ms）。
- `bundle exec jekyll build --config _config.yml`：exit 0，1.283s。

## 接下来

- [x] 隔离分支 `codex/admin-editor-handoff-20261024` 已创建并推送（见下方「关键现状与边界」的提交记录）。
- [x] 编辑器 Markdown 往返缺陷 D1–D6 已修复，回归数据见上；代码提交与文档提交已在同一分支。
- [x] **Draft PR 已创建**：https://github.com/SeanWang114514/Personal-blog/pull/2 （未合并，等站点范围确认）。
- [ ] **部署 `blog-admin` Edge Function（唯一硬阻塞）**：本机没有 `supabase` CLI、也没有 access token，需要仓库所有者执行 `supabase login` 后运行
      `supabase functions deploy blog-admin --project-ref sjhcqdicvahlqlpnupas --use-api`
      部署前确认登录的是项目 `sjhcqdicvahlqlpnupas`，保留现有 `GITHUB_CONTENT_TOKEN` Secret（有效期至 2027-01-16），不要输出或复制任何 Secret。
- [ ] 部署后回到浏览器复测：点开任意已发布文章 → 正文非空、标题/日期/分类/标签/封面与仓库一致 → 再跑一遍 Node 测试、Deno check/test、Jekyll 构建并记录结果。
- [ ] 与用户确认「整站 Firefly 改造」的上传范围后再决定是否把未提交站点文件并入分支；未确认前不合并 `main`、不发布。

## 追加轮次二：正文纸面尺寸与失败提示（D8 / D9）

用户反馈两件事：①后台点已发布文章没有反应；②新建文章时正文“白纸”过小。排查与处理如下。

- **①的根因是部署落后，不是前端 bug**：点列表项走 `js/admin.js:310-322` → `api.adminRequest({action:"read"})`；线上函数返回“未知操作。”，异常被 `js/admin.js:47` 写成状态栏文本，编辑器因此不打开，看起来像“点了没反应”。未登录探测线上函数（`list`/`read`/`save`/`nope` 四种 action）全部返回 401「请先登录。」，说明鉴权在 action 分发之前，**无法用无凭证请求判断线上是否已有 read**；唯一确定来源仍是登录后的“未知操作。”。
- **D9 修复**：`js/admin.js` 的 `operation()` 捕获到“未知操作 / unknown action”时改写为可执行提示（直接给出 `supabase functions deploy blog-admin --project-ref sjhcqdicvahlqlpnupas --use-api`），并给状态栏加 `.is-error` 红色样式，不再只显示一行 server 原文。
- **D8 修复（纸面过小）**：`.admin__rich-body` 由 `width: min(100%, 72rem)`（固定 1152px）改为铺满编辑器宽度 + `padding-inline: max(clamp(1.25rem,3vw,3rem), calc((100% - 72rem)/2))`，即纸面变宽而正文行宽仍锁在 72rem 便于阅读；`min-height` 由 `66vh` 改为 `clamp(30rem, 68vh, 60rem)`；源码框 `.admin__source-text` 同样铺满（行宽 74rem）。另外在 `body.ff-admin-page` 下隐藏装饰性 `#wallpaper-wrapper` 并给 `.content-panel` 补 `padding-top: calc(var(--ff-navbar-h) + 1rem)`，腾出 200 余像素；`.admin__fields` 在 ≥1100px 改为三列，字段区高度 282px → 178px。
- **实测（无注入，直接量真实页面）**：

  | 视口 | 改前纸面 | 改后纸面 | 纸面起始 y | 字段列数 | 横向滚动 |
  | --- | --- | --- | --- | --- | --- |
  | 1440×900 | 1152×594 | 1354×612 | 977 → 736 | 3 | 无（docW 1440） |
  | 1920×1080 | 1152×713 | 1536×734 | 1031 → 736 | 3 | 无 |
  | 1024×768 | 1152×…（溢出容器） | 963×… | — | 2 | 无 |
  | 390×844 | 358×608 | 358×608 | 1197 | 1 | 无（docW 390） |

- 视觉复核（vision.js）：全页无背景横幅、字段三列、纸面接近页面宽度、无遮挡/错位/溢出；390 宽单列、工具栏可见、无横向滚动与文字重叠。
- **部署前置条件已进一步收窄**：`npx --yes supabase --version` 返回 `2.122.0`，即 CLI 可通过 npx 取到，本机只缺登录态（`~/.supabase` 只有 telemetry.json，环境变量无 `SUPABASE_ACCESS_TOKEN`）。用户二选一即可解锁部署：终端跑 `npx supabase login`，或到 Dashboard → Account → Access Tokens 生成后 `SUPABASE_ACCESS_TOKEN=sbp_xxx npx supabase functions deploy blog-admin --project-ref sjhcqdicvahlqlpnupas --use-api`（仍要保留 `GITHUB_CONTENT_TOKEN`，不要打印任何 Secret）。
- **探测方法教训**：复制 `tmp-verify/cprof2` 已不再携带管理员登录态（localStorage 无 `sw-github-auth-*`），点列表得到的只是 gate「请使用管理员 GitHub 账号登录」。纯布局验证请用 `tmp-verify/audit27.mjs` / `audit28.mjs` 的做法：解锁 `[data-admin-gate]`、`[data-admin-workspace]`、`form[data-admin-editor]` 的 hidden 并注入示例正文后量取几何值，不依赖登录。

## 关键现状与边界

- 本地仓库：`D:\VibeCoding\个人blog优化\dst-blog`，远端 `SeanWang114514/Personal-blog`，当前分支 `codex/admin-editor-handoff-20261024`。提交顺序：代码 `8f15039` → 文档 `10c189a` / `79d0c7a` → 验证记录 `b543ea8` → **缺陷修复 `13b89b1`（本轮，已推送）**。工作区仍有 73 条未提交的整站改造文件未动。
- 本地服务地址：`http://127.0.0.1:4000/Personal-blog/admin/`。当前已有 `bundle exec jekyll serve` 在跑（PID 23564，`ruby.exe`）；**不要另起第二个实例**，需要重启时先结束 20476/23564 进程树。
- 本地 Edge Function 源码已支持 `{ action: "read", path: "_posts/..." }`；线上服务目前不识别该 action，所以本地构建与测试通过不等于线上编辑可用。
- GitHub 功能分支目前只推送了 9 个编辑器、Edge Function、测试和交接文档文件；完整 Firefly 版站点的其他依赖仍是本地未提交改动，未上传。远端分支单独检出时不是完整可部署站点（`admin.html` 加载的 `js/admin.js`/`js/community.js`/`css/community.css` 真正被页面引用的接线在未提交的 `_includes/footer.html:111-113`、`_includes/head.html:67`、`head.html:130-134`），不要直接合并该分支或据此发布。
- GitHub Pages 部署只会发布仓库分支中的静态站点；它不会自动部署 Supabase Edge Function。
- 此工作区已有许多网站整体改造的未提交改动，它们组成当前 Firefly 版站点依赖；先厘清这些改动的归属并与用户确认后，再决定是否一起上传。不要用 reset、checkout、clean 等操作清除现有工作。
- `.gitignore` 目前缺少 `supabase/` 规则，`git add -A` 会把 `supabase/.temp/` 和 `config.toml` 一起加进来；提交前请逐文件 add。
- 不要提交 `_config_auth.yml`、本机 Supabase 凭据、OAuth Client Secret、服务端 Token 或任何真实用户会话数据。
- 浏览器里已有管理员登录态；只做已发布文章的读取和未保存编辑验证，不要提交生产内容、删除文章或评论。
- 完整验证证据在 `tmp-verify/`（工作区根，不在仓库内）：`editor-qa-report.md`、`git-audit.md`、`test-report.md`、`audit2–audit10.mjs`、`shots/`。