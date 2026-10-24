# 交给下一个 Agent 的提示词

请继续完成 Sean Wang 个人博客管理后台编辑器的上线前验证。先阅读 `_doc/next-agent-task.md`、`_doc/admin-backend.md` 与当前 Git 状态，再行动；本轮已有的代码、测试结果和线上阻塞点都已记录，不要重复重写编辑器。

## 项目

- 仓库目录：`D:\VibeCoding\个人blog优化\dst-blog`
- GitHub：`SeanWang114514/Personal-blog`
- 本地后台：`http://127.0.0.1:4000/Personal-blog/admin/`
- Supabase 项目 ref：`sjhcqdicvahlqlpnupas`

## 已有实现

- 已发布文章的逐篇读取 action `read`：`supabase/functions/blog-admin/index.ts`
- 宽幅单栏所见即所得文章编辑器、格式工具栏、Markdown 源码切换：`admin.html`、`js/admin.js`、`css/community.css`
- 本地 Edge Function 测试包括文章读取；Deno 检查、10 项 Edge Function 测试、13 项 Node 测试及 Jekyll 构建均已通过。

## 已知线上问题

本地浏览器登录为管理员后可以读到 6 篇文章列表，但选择任一文章时，线上 Supabase Edge Function 返回“未知操作”。本地源码已包含 `read` action，因此线上部署版本落后于工作区源码。GitHub Pages 推送不会部署 Supabase Edge Function。

## 工作顺序

1. 先检查 `git status`、当前分支和远端分支，保留所有既有修改；不要清理、回滚或直接推送到 `main`。
2. 查看准备好的功能分支和提交内容，确认没有配置文件或密钥；只在用户指定的 GitHub 仓库推送工作分支。
3. 连接本地 Jekyll 服务及浏览器，使用现有管理员登录态验证打开一篇已发布文章，确认标题、元数据和正文完整；检查 Markdown 源码切换、粗体/标题/列表/链接/图片/表格/代码块、自定义 HTML/SVG 源码块、返回列表和未保存离开提示。测试时不要提交任何生产文章、删除文章或评论。
4. 检查桌面和手机宽度下编辑器是否宽敞、工具栏是否可用、是否有文字遮挡或横向溢出。
5. 若 Supabase CLI 已登录且目标项目确认无误，部署 `blog-admin` Edge Function；如需登录、权限确认或重设凭据则停下交给用户，不要索取或打印 Secret。保留 Supabase 现有 `GITHUB_CONTENT_TOKEN` Secret。
6. 部署后重新测试文章读取接口。若成功，再运行 Node 测试、Deno 检查与测试、Jekyll 构建，并记录具体结果。
7. 整理 PR / 合并建议并更新 `_doc/next-agent-task.md`。未明确批准前，不要合并到 `main`，避免自动发布未完成站点。

## 验收标准

- 已发布文章点击后能显示仓库中的真实 Markdown 正文，正文非空且元数据一致。
- 编辑器支持所见即所得与源码切换；保存和发布按钮状态符合草稿/已发布状态。
- 自定义内容块不被静默删除；修改冲突时明确提示刷新，不覆盖新版本。
- 桌面/移动端无明显错位和横向滚动。
- 所有自动化检查通过；线上 Edge Function 的部署状态和浏览器读取结果均被明确记录。
- GitHub 变更仅包含站点代码和必要文档，不含凭据；未验证前不触碰生产文章。
