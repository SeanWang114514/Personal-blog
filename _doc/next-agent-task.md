# 下个 Agent 任务清单

更新时间：2026-10-24

## 已完成

- [x] 已发布文章按需读取接口已写入 `supabase/functions/blog-admin/index.ts`。
- [x] 管理后台使用单栏、宽幅所见即所得正文编辑器，保留 Markdown 源码切换；对应代码在 `admin.html`、`js/admin.js`、`css/community.css`。
- [x] `node --check`：`js/admin.js`、`js/community.js`、`js/sw.js` 通过。
- [x] `node --test _tests/content-motion.test.cjs _tests/github-auth.test.cjs`：13 项通过。
- [x] `npm exec --yes --package=deno -- deno check supabase/functions/blog-admin/index.ts` 通过。
- [x] `npm exec --yes --package=deno -- deno test --allow-env _tests/admin-edge.test.ts`：10 项通过。
- [x] `bundle exec jekyll build --config _config.yml` 通过。
- [x] 本地浏览器读取到管理员身份和 6 篇已发布文章；点击文章后，线上函数回复“未知操作”。

## 接下来

- [x] 已创建、提交并推送隔离分支 `codex/admin-editor-handoff-20261024`（提交 `8f15039`）。
- [ ] 用真实 Supabase 管理员会话再次验证打开文章、正文完整载入、编辑后离开提示、源码切换和格式操作；不保存生产文章。
- [ ] 检查旧文章中的表格、图片、代码块与自定义 HTML/SVG 块在可视化编辑和 Markdown 往返时是否保留。
- [ ] 用桌面和手机视口检查全宽编辑工作区、工具栏、字段和保存栏，无横向溢出。
- [ ] 将包含 `read` 动作的 `blog-admin` Edge Function 部署到 Supabase 项目 `sjhcqdicvahlqlpnupas`，再从浏览器确认文章读取成功。部署前确认 Supabase CLI 登录的是正确项目，并保留现有 `GITHUB_CONTENT_TOKEN` Secret；不要输出或复制任何 Secret。
- [ ] 完成回归后再决定是否建立 PR / 合并到 `main`，避免未验证的改动自动发布到 GitHub Pages。可用 PR 入口：`https://github.com/SeanWang114514/Personal-blog/pull/new/codex/admin-editor-handoff-20261024`

## 关键现状与边界

- 本地仓库：`D:\VibeCoding\个人blog优化\dst-blog`，远端 `SeanWang114514/Personal-blog`，当前分支 `codex/admin-editor-handoff-20261024`。
- 本地服务地址：`http://127.0.0.1:4000/Personal-blog/admin/`。如果旧服务未运行，使用 `bundle exec jekyll serve --host 127.0.0.1 --port 4000`。
- 本地 Edge Function 源码已支持 `{ action: "read", path: "_posts/..." }`；线上服务目前不识别该 action，所以本地构建通过不等于线上编辑可用。
- GitHub 功能分支目前只推送了 9 个编辑器、Edge Function、测试和交接文档文件（提交 `8f15039`、`5b8d0e5`）；完整 Firefly 版站点的其他依赖仍是本地未提交改动，未上传。远端分支单独检出时不是完整可部署站点，不要直接合并该分支或据此发布。
- GitHub Pages 部署只会发布 GitHub 仓库分支中的静态站点；它不会自动部署 Supabase Edge Function。
- 此工作区已有许多网站整体改造的未提交改动，它们组成当前 Firefly 版站点依赖；先厘清这些改动的归属并与用户确认后，再决定是否一起上传。不要用 reset、checkout、clean 等操作清除现有工作。
- 不要提交 `_config_auth.yml`、本机 Supabase 凭据、OAuth Client Secret、服务端 Token 或任何真实用户会话数据。
- 浏览器里已有管理员登录态；只做已发布文章的读取和未保存编辑验证，不要提交生产内容、删除文章或评论。
