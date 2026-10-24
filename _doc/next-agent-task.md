# 下个 Agent 任务清单

更新时间：2026-10-24（浏览器端全面验证完成，仅剩线上部署）

## 已完成

- [x] 已发布文章按需读取接口已写入 `supabase/functions/blog-admin/index.ts`。
- [x] 管理后台使用单栏、宽幅所见即所得正文编辑器，保留 Markdown 源码切换；对应代码在 `admin.html`、`js/admin.js`、`css/community.css`。
- [x] `node --check`：`js/admin.js`、`js/community.js`、`js/sw.js` 通过。
- [x] `node --test _tests/content-motion.test.cjs _tests/github-auth.test.cjs`：13 项通过。
- [x] `npm exec --yes --package=deno -- deno check supabase/functions/blog-admin/index.ts` 通过（隔离 `DENO_DIR` 全量复跑 0 诊断，阴性对照正确报错）。
- [x] `npm exec --yes --package=deno -- deno test --allow-env _tests/admin-edge.test.ts`：10 项通过。
- [x] `bundle exec jekyll build --config _config.yml` 通过（exit 0，0 warning / 0 error）。
- [x] 本地浏览器读取到管理员身份和 6 篇已发布文章；点击文章后，线上函数回复“未知操作”（已复现：`HTTP 400 {"error":"未知操作。"}`）。
- [x] 用真实管理员会话验证了新建草稿、6 个元数据字段、正文写入与脏标记、发布态切换（草稿/已发布文案与提示联动）、未保存离开 confirm（取消保留、确认回列表）。
- [x] 用真实文章做了 Markdown ↔ 所见即所得往返：表格、代码围栏、`<!--more-->`、`<details>` 自定义 HTML 块、内联 `<svg>` 均保留（`exactEqual=true`）。
- [x] 桌面/手机视口检查：1920/1440/1280/1024/768/430/390 全部无页面级横向滚动；移动端工具栏折 2 行、按钮最小 36×36、保存按钮滚动可达。
- [x] 冲突提示验证（mock 409）：状态栏显示“仓库内容已变化或文件已存在，请刷新后重试。”，编辑器不关闭、正文与脏标记保留。

## 新发现的缺陷（未修复，待确认）

- [ ] **D1 块引用内行内格式被静默丢弃**：`js/admin.js:220` blockquote 分支用 `element.innerText` 序列化，引用里的 `code`/`strong`/`a` 全部被拍平。复现：`> 按 \`v\` 出菜单，**粗体**，[链接](https://example.com/x)。` → 回写为纯文本。
- [ ] **D2 加粗包住含 `*` 的行内代码时被解析错并转义**：`renderMarkdown` 的强调解析未保护 code span。复现：`官方规则**只复制顶层 \`*.yaml\`、\`*.txt\`**，不带其他。` → 富文本出现 `<code><em>.yaml</em></code>` 且回写为 `\*\*...``。**真实文章命中**：`_posts/2026-09-30-weasel-vmenu-suite.markdown:170`。
- [ ] **D3 嵌套列表被拍平**：`renderMarkdown` 列表解析不处理缩进层级，二级列表退化为同级 `<li>`。
- [ ] （建议）保存按钮依赖表单原生校验，`#admin-post-date` 为 `type="datetime-local" required`；值非法时浏览器静默拦截提交、无提示。建议在 `js/admin.js:618` 的 submit 前加显式校验文案。

## 接下来

- [x] 已创建、提交并推送隔离分支 `codex/admin-editor-handoff-20261024`（代码提交 `8f15039`，文档提交 `10c189a`，当前 HEAD `79d0c7a`）。
- [ ] **部署 `blog-admin` Edge Function（唯一硬阻塞）**：本机没有 `supabase` CLI、也没有 access token，需要仓库所有者执行 `supabase login` 后运行
      `supabase functions deploy blog-admin --project-ref sjhcqdicvahlqlpnupas --use-api`
      部署前确认登录的是项目 `sjhcqdicvahlqlpnupas`，保留现有 `GITHUB_CONTENT_TOKEN` Secret（有效期至 2027-01-16），不要输出或复制任何 Secret。
- [ ] 部署后回到浏览器复测：点开任意已发布文章 → 正文非空、标题/日期/分类/标签/封面与仓库一致 → 再跑一遍 Node 测试、Deno check/test、Jekyll 构建并记录结果。
- [ ] 决定是否在本轮追加修复 D1–D3（都在 `js/admin.js`，可同一分支追加提交）。
- [ ] 完成上述后建立 **Draft PR**（本机 `gh` 已登录 `SeanWang114514`，仓库暂无任何 PR），不要直接合并 `main`。

## 关键现状与边界

- 本地仓库：`D:\VibeCoding\个人blog优化\dst-blog`，远端 `SeanWang114514/Personal-blog`，当前分支 `codex/admin-editor-handoff-20261024`（HEAD `79d0c7a`，与 origin 同步，工作区 73 条未提交改动未动）。
- 本地服务地址：`http://127.0.0.1:4000/Personal-blog/admin/`。当前已有 `bundle exec jekyll serve` 在跑（PID 23564，`ruby.exe`）；**不要另起第二个实例**，需要重启时先结束 20476/23564 进程树。
- 本地 Edge Function 源码已支持 `{ action: "read", path: "_posts/..." }`；线上服务目前不识别该 action，所以本地构建与测试通过不等于线上编辑可用。
- GitHub 功能分支目前只推送了 9 个编辑器、Edge Function、测试和交接文档文件；完整 Firefly 版站点的其他依赖仍是本地未提交改动，未上传。远端分支单独检出时不是完整可部署站点（`admin.html` 加载的 `js/admin.js`/`js/community.js`/`css/community.css` 真正被页面引用的接线在未提交的 `_includes/footer.html:111-113`、`_includes/head.html:67`、`head.html:130-134`），不要直接合并该分支或据此发布。
- GitHub Pages 部署只会发布仓库分支中的静态站点；它不会自动部署 Supabase Edge Function。
- 此工作区已有许多网站整体改造的未提交改动，它们组成当前 Firefly 版站点依赖；先厘清这些改动的归属并与用户确认后，再决定是否一起上传。不要用 reset、checkout、clean 等操作清除现有工作。
- `.gitignore` 目前缺少 `supabase/` 规则，`git add -A` 会把 `supabase/.temp/` 和 `config.toml` 一起加进来；提交前请逐文件 add。
- 不要提交 `_config_auth.yml`、本机 Supabase 凭据、OAuth Client Secret、服务端 Token 或任何真实用户会话数据。
- 浏览器里已有管理员登录态；只做已发布文章的读取和未保存编辑验证，不要提交生产内容、删除文章或评论。
- 完整验证证据在 `tmp-verify/`（工作区根，不在仓库内）：`editor-qa-report.md`、`git-audit.md`、`test-report.md`、`audit2–audit10.mjs`、`shots/`。
