---
layout:     post
title:      "Geekbench 性价比天梯图：一张图看懂 CPU / GPU 跑分与价格"
subtitle:   "把 Geekbench 跑分和人民币价格放在同一张图里"
date:       2026-08-02 15:00:00
author:     "Sean Wang"
header-img: "img/post-bg-infinity.jpg"
catalog: true
tags:
    - Geekbench
    - GPU
    - CPU
    - 硬件
---

装机、升级或者纠结要不要换显卡的时候，跑分和价格永远是最核心的两个问题：性能强不强，值不值这个价。于是我做了一个 [geekbench-value-ladder](https://github.com/SeanWang114514/geekbench-value-ladder) 项目：一个单文件网页，把 GPU / CPU 的 Geekbench 跑分和人民币价格放在同一张天梯图里，直接看性能和性价比。

在线体验：[Geekbench 性价比天梯图](https://seanwang114514.github.io/geekbench-value-ladder/)

## 它能做什么

- 显卡 / CPU 一键切换，性能榜 / 性价比榜两种视图切换
- 按品牌筛选：NVIDIA、AMD、Intel、Apple，各有对应颜色标识
- 支持搜索型号（比如 `RTX 5080`、`7800X3D`）和加载更多
- 性价比 = Geekbench 跑分 ÷ 价格（元），榜单会直接给出每分钱能买到多少性能
- 价格标签标注来源（ZOL 电商价 / 参考价、苏宁估价等），点击即可跳转到对应详情页或电商搜索页

## 数据从哪来

- Geekbench 跑分：[cpuranklist](https://cpuranklist.com/) 的 GPU / CPU 榜单
- 人民币价格：中关村在线 ZOL 的显卡 / CPU 报价，电商估价用苏宁易购搜索兜底
- 同一型号多个价格时取最低价，价格来源可以追溯到具体页面

页面默认使用内置的数据快照，纯静态模式直接打开 `index.html` 就能看。

## 本地自动更新价格

GitHub Pages 是纯静态托管，只能展示最后一次内嵌的数据快照。想要每天自动更新价格，可以本地跑：

```bash
node server.mjs
```

然后访问 `http://127.0.0.1:8765`。服务会每天抓取一次当日价格；在设置里隐藏参考价后，还会自动为只有参考价的型号抓取电商估价，抓取失败的型号会从性价比榜移除，并显示成功 / 失败数量。

如果更新了 `data.json`，还可以用 `node build.mjs` 把它重新内嵌进 `index.html`，生成新的静态页面。

## 技术细节

- 最终交付物是单文件 `index.html`，不依赖任何框架和后端
- `scrape.mjs` 负责抓取跑分、价格和电商估价，并做型号匹配
- `server.mjs` 提供每日价格更新、电商估价和手动刷新跑分接口
- `index.template.html` + `build.mjs` 负责生成最终页面

## 适合谁用

无论是想查某张显卡值不值，还是想快速比较一堆 CPU 的性价比，这个页面都能省掉来回查榜单和报价的时间。欢迎体验，也欢迎到仓库提 issue 或点个 star。
