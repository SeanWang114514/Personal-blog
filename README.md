# Sean Wang 的个人博客

「离开世界之前 一切都是过程」

Sean Wang（WSL）的个人站点 —— 博客、软件、云盘、下载、项目、工具箱、收藏夹。

站点地址：**<https://seanwang114514.github.io/Personal-blog/>**

---

## 这个站有什么

| 板块 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | Hero、板块导航、最新文章、精选软件、标签云 |
| 博客 | `/blog/` | 全部文章，支持标签筛选 + 关键词搜索 + 分页 |
| 软件 | `/software/` | 自研工具合集，含能力速览与版本对照表 |
| 云盘 | `/drive/` | 常用网盘入口、容量限速说明与备份原则 |
| 下载 | `/download/` | 所有安装包集中一处，主推 + 完整清单 + FAQ |
| 项目 | `/projects/` | 作品集，含技术栈分布 |
| 工具箱 | `/toolbox/` | 104 个常用站点快捷入口（7 类，标注开源 / 国内），带本地时钟与可收藏 |
| 收藏夹 | `/bookmarks/` | 长期沉淀的学习资料与文档 |
| 归档 | `/archive/` | 按年份浏览全部文章 |
| 友情链接 | `/friends/` | 友链 + 交换说明 |
| 关于 | `/about/` | 自我介绍与折腾时间线 |

---

## 技术栈

- **Jekyll 4.3** + Liquid —— 静态站点生成，无前端框架、无数据库
- **自研设计系统** `css/sw.css` —— 深色优先、玻璃拟态、渐变光效，CSS 变量驱动
- **原生 JavaScript** `js/sw.js` —— 主题切换、搜索、筛选、TOC、时钟，零依赖
- **SVG 雪碧图** `_includes/icons.html` —— 60+ 图标，`currentColor` 驱动，无字体依赖
- **GitHub Pages** 部署 —— `main` 分支 push 后由 Actions 自动构建

---

## 本地开发

需要 Ruby 3.1+。

```bash
bundle install
bundle exec jekyll serve
```

然后打开 <http://127.0.0.1:4000/Personal-blog/>。

> `_config.yml` 里 `baseurl: "/Personal-blog"`，本地预览也要带这个子路径。

---

## 内容怎么改

站点的「软件 / 下载 / 项目 / 工具箱 / 收藏夹 / 友链 / 导航」全部由 `_data/` 下的 YAML 驱动，
**不需要改任何模板**，往对应文件里加条目即可。

### 加一款软件

编辑 `_data/software.yml`：

```yaml
- name: 软件名
  slug: my-software          # 用于下载页锚点
  tagline: 一句话卖点
  desc: 稍长一点的介绍……
  logo: M                    # 单字母或两个字
  logoClass: logo-cyan       # logo-violet / cyan / emerald / amber / rose / indigo / slate / pink
  category: desktop          # desktop | web | ai | dev
  platform: Windows
  version: "1.0"
  size: 100 MB
  license: 开源
  lang: C++ / Win32
  tags: [工具, 示例]
  repo: https://github.com/SeanWang114514/...
  post: /2026/01/01/my-post/ # 可选，介绍文章
  featured: true             # 可选，会在首页精选区出现
  highlights:                # 可选，会出现在软件页的能力速览
    - 亮点一
    - 亮点二
```

### 加一个下载条目

编辑 `_data/downloads.yml`。`primary: true` 的会出现在下载页顶部主推区。
`type` 决定图标：`exe` / `zip` / 其他。

### 加一个项目

编辑 `_data/projects.yml`。`category` 取 `desktop` 或 `web`，会进对应的筛选分类。

### 加工具 / 收藏 / 友链

分别编辑 `_data/toolbox.yml`、`_data/bookmarks.yml`、`_data/friends.yml`。
工具箱和收藏夹的条目自带「收藏到本机」按钮（数据存 localStorage）。

工具箱的条目除 `name` / `url` / `desc` 外，还有两个可选标记：

```yaml
- name: Hoppscotch
  url: https://hoppscotch.io
  desc: 开源 API 调试客户端
  oss: true      # 名称后挂「开源」小标
  cn: true       # 名称后挂「国内」小标（访问更快）
```

分组用 `key` / `title` / `icon` / `desc`，`icon` 取 `_includes/icons.html` 里的图标 id（去掉 `i-` 前缀）。
页面顶部「N 个站点 / M 类」是从 YAML 里自动算出来的，不用手动改。

### 调整顶栏导航

编辑 `_data/nav.yml`。`key` 要和页面 front matter 里的 `nav:` 对上才会高亮；
`icon` 填 `_includes/icons.html` 里的图标 id（去掉 `i-` 前缀）。

### 写一篇文章

在 `_posts/` 新建 `YYYY-MM-DD-slug.markdown`：

```yaml
---
layout:     post
title:      "文章标题"
subtitle:   "副标题"
date:       2026-01-01 12:00:00
author:     "Sean Wang"
header-img: "img/preview/<slug>.svg"
catalog:    true
tags:
    - 工具
---
```

正文里 `##` / `###` 标题会自动生成右侧目录和锚点。

---

## 需要你补的两个配置

1. **评论（Giscus）**
   `_config.yml` 里 `giscus.repo_id` 和 `giscus.category_id` 目前留空，因此评论框**不会渲染**（这是刻意的，避免出现坏掉的嵌入）。
   到 <https://giscus.app> 选好仓库与 Discussion 分类，把生成的 id 填进去即可全站生效。

2. **访问统计**
   原站遗留的 `ga_track_id` / `ga_domain` 指向的是模板作者的账号，已**清空**，现在不加载任何第三方统计脚本。
   需要统计就填自己的 Measurement ID；不需要就保持空。

> 另外 `_data/friends.yml` 和 `_data/drive.yml` 里的部分条目是示例数据，
> 发布前请替换成真实链接。

---

## 部署

推送到 `main` 分支即自动部署，workflow 在 `.github/workflows/jekyll.yml`。

首次部署前需要在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

---

## 迁移说明

本仓库由 `SeanWang114514/SeanWang114514.github.io` 迁移而来：文章、图片与项目资源全部保留，
URL 结构维持 `/:year/:month/:day/:title/`（`permalink: pretty`），
但会因为站点从根路径变为 `/Personal-blog/` 子路径而带上前缀。

原站的 Hux Blog 主题样式（Bootstrap / jQuery / `hux-blog.css`）已被全新的设计系统替换。

---

## 授权

文章内容版权归 Sean Wang 所有；站点代码与主题部分沿用 [Apache-2.0](LICENSE)。
