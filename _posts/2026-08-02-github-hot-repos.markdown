---
layout:     post
title:      "GitHub 高星新项目：用 AI 帮你发现新晋热门仓库"
subtitle:   "一个基于 GitHub Search API 的新仓库速览工具"
date:       2026-08-02 12:00:00
author:     "Sean Wang"
header-img: "img/post-bg-web.jpg"
catalog: true
tags:
    - GitHub
    - AI
    - 工具
---

GitHub Trending 是很多人每天必刷的页面，但它更偏向“老牌项目”，新仓库想冒头并不容易。于是我做了 [github-hot-repos](https://github.com/SeanWang114514/github-hot-repos) 这个小项目：一个纯静态的“GitHub 高星新项目”速览站点，专门抓取最近 7 / 30 / 90 天创建、按 Stars 排序的新仓库。

在线体验：[GitHub 高星新项目](https://seanwang114514.github.io/github-hot-repos/)

## 它能做什么

- 数据来自 GitHub Search API，抓取近 7 / 30 / 90 天创建的高星项目，默认按 Stars 倒序
- 按项目类型自动分类，每个分类默认展示 3 个项目，可以一键展开全部
- 顶部有统计概览，支持周期切换、刷新和加载更多
- 每张项目卡片包含仓库名、owner、简介、语言、Star 数和创建时间

## AI 翻译与总结

这个项目最有意思的地方是 AI 能力：

- 通过本地 Ollama 或 OpenAI 兼容接口，自动为英文项目生成中文总结与翻译简介
- 内置了一批常见项目的翻译缓存，接口不可用时也有兜底
- 模型地址、模型名和 API Key 都可以在页面右上角设置，配置只保存在浏览器 localStorage，不会写入任何文件

AI 翻译默认连接本地 Ollama（`http://localhost:11434`），本地服务不可用时自动回退直连 Ollama；如果远程 API 在浏览器中受 CORS 限制，还可以用 `node server.js` 起一个本地代理。

## 技术细节

- 纯 HTML / CSS / JavaScript 单页应用，无需后端，直接打开 `index.html` 就能用
- 数据全部来自 GitHub 公开 API
- 已部署到 GitHub Pages，代码托管在 [SeanWang114514/github-hot-repos](https://github.com/SeanWang114514/github-hot-repos)

README 里还写着这个站点 100% 由 DeepSeekv4Flash 编写，算是 AI 辅助开发的一次小实践。

## 为什么值得试试

每天想看看 GitHub 上有什么新东西时，与其在 Trending 上翻来翻去，不如直接看“新仓库里谁涨 Star 最快”。这个工具把“新增 + 高星 + 分类 + 中文简介”组合在一起，几分钟就能扫完最近一周值得关注的开源项目。

欢迎体验：[GitHub 高星新项目](https://seanwang114514.github.io/github-hot-repos/)，也欢迎到仓库提 issue 或点个 star。
