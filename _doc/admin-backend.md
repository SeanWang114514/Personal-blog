# 站内评论与管理后台

2026-10-18

## 当前状态

- 前端与服务端代码已完成，数据库迁移已在 Supabase 项目 `sjhcqdicvahlqlpnupas` 执行并通过 RLS 验证。
- `blog_comments`、`blog_profiles`、`blog_admins` 已创建；管理员为 GitHub ID `300768697`（SeanWang114514）。
- 细粒度 GitHub 发布凭据已生成，并仅保存为 Supabase Edge Functions Secret `GITHUB_CONTENT_TOKEN`。
- 线上 `blog-admin` 仍为 ACTIVE，但当前部署版本尚未包含本轮新增的 `read` action；Data API 已仅开放 `blog_comments` 和 `blog_profiles`，因此 `_config.yml` 的 `community.enabled` 已设为 `true`。重新部署 Edge Function 后，后台才能读取已发布文章正文。
- GitHub 登录已完成配置；旧 GitHub Discussions 保留，不迁移或删除原评论。
- 未提交、推送本地改动，也未发布测试文章或测试评论。

## 组件与权限

`js/sw.js` 提供唯一的 `SWAuth` 客户端和会话。站内评论、账号菜单、管理后台共同使用该会话。本地装饰账号没有评论或管理权限。

管理员由 `blog_admins` 中的 GitHub 数字 ID 与 `auth.identities` 的 GitHub 身份匹配，初始只包含已核实的 `300768697`（SeanWang114514）。不使用用户名、客户端角色或可编辑个人资料决定权限。

Data API 只开放 `blog_comments` 与 `blog_profiles`；`blog_admins` 无 `anon` / `authenticated` 表权限。评论读取由 RLS 区分公开评论与本人/管理员可见的隐藏评论。仅供策略和触发器使用的 GitHub 身份、资料同步、频率限制函数位于未暴露的 `private` schema；`public.blog_is_admin()` 只允许已登录用户调用。

| 操作 | 访客 | GitHub 普通用户 | 管理员 |
| --- | --- | --- | --- |
| 阅读公开评论 | 是 | 是 | 是 |
| 发表评论 | 否 | 是 | 是 |
| 删除自己的评论 | 否 | 是 | 是 |
| 查看隐藏评论 | 否 | 仅自己的 | 全部 |
| 隐藏、恢复、删除他人评论 | 否 | 否 | 是 |
| 发布文章、管理标签分类 | 否 | 否 | 是 |

评论按纯文本显示，最多 5000 字；数据库限制同一账号每分钟最多 5 条。作者与时间由数据库生成，客户端不能指定。公开个人资料只包含显示名、GitHub 用户名、头像，不公开邮箱。

后台地址为 `/Personal-blog/admin/`。文章列表只载入摘要，选择文章时再从仓库读取完整 Markdown；编辑区默认使用所见即所得格式工具栏，也可切换 Markdown 源码。自定义 HTML / SVG 块保留为可展开源码区域，避免误改已有图示。支持导入不超过 500 KB 的 Markdown 文件、编辑 YAML 与正文、下载文稿、提交和删除文章。标签分类支持添加、重命名、删除；重命名和删除会同步修改文章头部。尚未用于文章的标签记录在 `_data/blog-taxonomy.yml`，公开归档仍由实际文章生成。

## 部署顺序

1. 数据库迁移已执行，不要重复运行 `supabase/migrations/202610180001_blog_community.sql`；它是完整初始化脚本，不是增量修复脚本。
2. Data API 只暴露 `public` schema、`blog_comments` 和 `blog_profiles`。访问控制继续依赖 RLS；`blog_admins` 不授予客户端表权限。
3. GitHub 发布凭据已按最小权限生成：仅 `SeanWang114514/Personal-blog`，Contents 读写、Metadata 只读，有效期至 2027-01-16。不要再次生成，也不要在日志或聊天中输出凭据。
4. 凭据已保存为 Edge Functions Secret `GITHUB_CONTENT_TOKEN`。不要放进 `_config.yml`、GitHub Pages、仓库 Actions 公开变量、日志或聊天。
5. 本轮源码需要重新部署 `blog-admin`。`supabase/config.toml` 关闭旧网关 JWT 校验；函数自身先调用 Auth `getUser` 验证 Bearer 会话，再调用 `blog_is_admin`，两者均通过才访问 GitHub。不能移除这两层校验。仅推送 GitHub 仓库不会更新 Supabase Edge Function。
6. Data API 配置完成后，保持 `community.enabled: true`；修改配置后需重启 Jekyll。

已登录 Supabase CLI 时可使用：

```powershell
supabase functions deploy blog-admin --project-ref sjhcqdicvahlqlpnupas --use-api
```

函数使用项目默认的 `SUPABASE_URL` 与 `SUPABASE_ANON_KEY`，校验用户时沿用请求的 Bearer；不需要 service_role。允许来源仅为生产站点和本地 4000 端口。

## 发布边界

文章服务固定操作 `SeanWang114514/Personal-blog` 的 `main` 分支，只接受 `_posts/YYYY-MM-DD-slug.md` 或 `.markdown`。不允许路径穿越、嵌套目录、工作流或站点配置写入。分类操作还会写入 `_data/blog-taxonomy.yml`。文章修改需要最新 SHA，分类批处理使用非强制的原子提交，冲突应刷新重试。

提交文章会触发仓库现有 GitHub Actions；网页内容在构建完成后更新。工作区中未推送的文章改动不会自动进入后台，后台读取的是 GitHub 仓库版本。文章中的图片仍使用已有资源路径，本版本不包含媒体上传。

## 维护

凭据到期前重新生成相同最小权限的 Token，替换 Supabase Secret，再撤销旧 Token。撤销 GitHub 登录授权与撤销文章发布 Token 是两个独立操作。

增加管理员时先核实 GitHub 数字 ID，再由项目所有者在 SQL Editor 修改 `blog_admins`；不要开放前端修改管理员名单。移除后刷新会话，服务端会即时拒绝后续管理请求。

如需暂时回退站内评论，将 `community.enabled` 设为 `false` 并重新构建；GitHub Discussions 入口仍保留。数据库中的站内评论仍保留。

## 验证

```powershell
node --test _tests/content-motion.test.cjs _tests/github-auth.test.cjs
npm exec --yes --package=deno -- deno check supabase/functions/blog-admin/index.ts
npm exec --yes --package=deno -- deno test --allow-env _tests/admin-edge.test.ts
```

浏览器还需验证：管理员标签和后台入口、普通用户拒绝访问、退出后评论禁用、隐藏评论的可见范围、头像尺寸及首屏动画。自动测试不代替平台的真实 RLS 和发布验证；未经确认不发布测试文章或评论。

官方文档：

- <https://supabase.com/docs/guides/database/postgres/row-level-security>
- <https://supabase.com/docs/guides/functions/auth>
- <https://supabase.com/docs/guides/functions/secrets>
- <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens>
