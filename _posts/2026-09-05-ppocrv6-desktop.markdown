---
layout:     post
title:      "PP-OCRv6 Desktop：一个纯 C++ 的离线 OCR + 翻译桌面工具"
subtitle:   "截图即识别、即翻译，无需联网，无需 Python，单文件直接运行"
date:       2026-09-05 23:00:00
author:     "Sean Wang"
header-img: "img/post-bg-unix-linux.jpg"
catalog: true
tags:
    - AI
    - 工具
    - C++
    - OCR
    - PaddleOCR
---

> 一个原生 Win32 C++ 应用，截图即识别、即翻译，无需联网，无需 Python，单文件直接运行。

<div style="border:1px solid #E8E8E8;border-left:4px solid #1677FF;border-radius:8px;padding:16px 20px;margin:24px 0;background:#F0F5FF;">
<div style="font-size:15px;font-weight:600;color:#262626;margin-bottom:4px;">快速下载</div>
<div style="font-size:13px;color:#595959;">在 <a href="https://github.com/SeanWang114514/PP-OCRv6-Desktop/releases" style="color:#1677FF;">GitHub Releases</a> 下载 <code>ChineseOCRLiteDesktop.exe</code>，单文件、免安装，双击即用（约 250MB）。项目源码：<a href="https://github.com/SeanWang114514/PP-OCRv6-Desktop" style="color:#1677FF;">PP-OCRv6-Desktop</a>。</div>
</div>

<!--more-->

## 为什么做这个

市面上的 OCR 工具大多依赖 Python 运行时，装一堆依赖才能跑起来；在线 API 又要联网、要注册、有调用限制。我只是想快速截图识别一段文字、翻译成英文，但每次都要打开浏览器或者等 Python 环境加载，体验并不流畅。

于是我做了一个 **PP-OCRv6 Desktop**：一个纯 C++ 编写的 Windows 桌面工具，截图 → OCR → 翻译，全程离线，双击即用。

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PP-OCRv6 Desktop 三步流程：截图、识别、翻译">
<defs>
<marker id="f1-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#BFBFBF"/></marker>
</defs>
<rect x="1" y="1" width="718" height="318" rx="12" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="32" y="38" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="20" font-weight="700" fill="#262626">PP-OCRv6 Desktop</text>
<text x="32" y="60" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" fill="#8C8C8C">离线 OCR + 中英翻译 · 纯 C++ · 单文件运行</text>
<rect x="556" y="24" width="132" height="30" rx="15" fill="#E6F4FF"/>
<text x="622" y="44" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#1677FF">Windows · x64</text>
<line x1="32" y1="76" x2="688" y2="76" stroke="#F0F0F0"/>
<!-- Step 1 -->
<rect x="32" y="96" width="202" height="156" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="52" y="124" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#8C8C8C">STEP 01</text>
<rect x="52" y="136" width="44" height="44" rx="8" fill="#E6F4FF"/>
<rect x="62" y="147" width="24" height="18" rx="2" fill="none" stroke="#1677FF" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="74" y1="152" x2="74" y2="160" stroke="#1677FF" stroke-width="1.5"/>
<line x1="70" y1="156" x2="78" y2="156" stroke="#1677FF" stroke-width="1.5"/>
<text x="52" y="208" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">截图识别</text>
<text x="52" y="230" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">全局快捷键，框选即识别</text>
<!-- Step 2 -->
<rect x="259" y="96" width="202" height="156" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="279" y="124" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#8C8C8C">STEP 02</text>
<rect x="279" y="136" width="44" height="44" rx="8" fill="#E6F4FF"/>
<rect x="288" y="147" width="26" height="5" rx="2.5" fill="#1677FF"/>
<rect x="288" y="156" width="26" height="5" rx="2.5" fill="#1677FF" opacity="0.65"/>
<rect x="288" y="165" width="16" height="5" rx="2.5" fill="#1677FF" opacity="0.35"/>
<text x="279" y="208" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">OCR 识别</text>
<text x="279" y="230" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">PP-OCRv6 Tiny 本地推理</text>
<!-- Step 3 -->
<rect x="486" y="96" width="202" height="156" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="506" y="124" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#8C8C8C">STEP 03</text>
<rect x="506" y="136" width="44" height="44" rx="8" fill="#E6F4FF"/>
<text x="513" y="165" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="15" font-weight="700" fill="#1677FF">中</text>
<line x1="532" y1="158" x2="542" y2="158" stroke="#1677FF" stroke-width="1.5" marker-end="url(#f1-arrow)"/>
<text x="544" y="165" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#1677FF">En</text>
<text x="506" y="208" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">中英翻译</text>
<text x="506" y="230" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">本机互译，自动检测语言</text>
<line x1="238" y1="174" x2="255" y2="174" stroke="#BFBFBF" stroke-width="1.5" marker-end="url(#f1-arrow)"/>
<line x1="465" y1="174" x2="482" y2="174" stroke="#BFBFBF" stroke-width="1.5" marker-end="url(#f1-arrow)"/>
<text x="360" y="292" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">离线运行 · 单文件约 250MB · 无需 Python 环境</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 1 · 从截图到译文的三步流程，全程在本机完成</p>

## 功能一览

这个工具麻雀虽小，五脏俱全：

| 功能 | 说明 |
|------|------|
| 截图识别 | 全局快捷键 `Ctrl + Alt + S` 一键截图，框选区域后自动异步 OCR |
| 中英翻译 | 内置 MTranServer，支持中→英 / 英→中翻译，源语言自动检测 |
| Apple HIG 界面 | 圆角卡片与分组布局，Light / Dark 双主题自动跟随系统 |
| 托盘常驻 | 关闭主窗口最小化到托盘，双击图标恢复 |
| 自定义快捷键 | 可自由修改截图快捷键 |
| 开机自启动 | 可选开机自启动 + 启动后隐藏到托盘 |
| 快速清理 | 识别结果支持一键删除空格 / 删除换行 |
| 窗口记忆 | 记住主窗口 / 设置窗口 / 结果窗口的大小与位置 |
| 内存优化 | 隐藏到托盘或空闲 60 秒自动释放工作集 |

其中最值得一提的是界面设计。作为一个 Windows 工具，我参考 Apple Human Interface Guidelines 做了这套 UI：圆角卡片、分组背景、扁平化控件，整体干净利落。Light / Dark 双主题自动跟随系统切换，不需要手动设置。下图是同一窗口在两种主题下的对照——结构完全一致，只替换色板，这也是大厂规范里换肤的标准做法：

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="浅色与深色主题对照">
<!-- Light card -->
<rect x="8" y="8" width="344" height="264" rx="12" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="36" cy="36" r="5" fill="#1677FF"/>
<text x="48" y="41" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">PP-OCRv6 Desktop</text>
<rect x="284" y="24" width="48" height="22" rx="11" fill="#F5F5F5"/>
<text x="308" y="39" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">Light</text>
<line x1="28" y1="56" x2="332" y2="56" stroke="#F0F0F0"/>
<rect x="28" y="72" width="304" height="76" rx="8" fill="#FAFAFA" stroke="#F0F0F0"/>
<circle cx="46" cy="92" r="4" fill="#52C41A"/>
<text x="58" y="96" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#595959">识别完成 · 3 段文本</text>
<text x="44" y="120" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">离线 OCR + 中英翻译</text>
<text x="44" y="139" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">Hello World · 你好世界</text>
<rect x="28" y="164" width="148" height="36" rx="6" fill="#1677FF"/>
<text x="102" y="187" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">复制文本</text>
<rect x="184" y="164" width="148" height="36" rx="6" fill="#FFFFFF" stroke="#D9D9D9"/>
<text x="258" y="187" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" fill="#595959">翻译</text>
<text x="180" y="228" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">跟随系统 · 浅色模式</text>
<text x="180" y="250" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#BFBFBF">文字 #262626 · 背景 #FFFFFF · 边框 #E8E8E8</text>
<!-- Dark card -->
<rect x="368" y="8" width="344" height="264" rx="12" fill="#1F1F1F" stroke="#303030"/>
<circle cx="396" cy="36" r="5" fill="#1677FF"/>
<text x="408" y="41" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#F0F0F0">PP-OCRv6 Desktop</text>
<rect x="644" y="24" width="48" height="22" rx="11" fill="#262626"/>
<text x="668" y="39" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#A6A6A6">Dark</text>
<line x1="388" y1="56" x2="692" y2="56" stroke="#303030"/>
<rect x="388" y="72" width="304" height="76" rx="8" fill="#262626" stroke="#434343"/>
<circle cx="406" cy="92" r="4" fill="#52C41A"/>
<text x="418" y="96" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#A6A6A6">识别完成 · 3 段文本</text>
<text x="404" y="120" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#F0F0F0">离线 OCR + 中英翻译</text>
<text x="404" y="139" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#A6A6A6">Hello World · 你好世界</text>
<rect x="388" y="164" width="148" height="36" rx="6" fill="#1677FF"/>
<text x="462" y="187" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#FFFFFF">复制文本</text>
<rect x="544" y="164" width="148" height="36" rx="6" fill="#262626" stroke="#434343"/>
<text x="618" y="187" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" fill="#F0F0F0">翻译</text>
<text x="540" y="228" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">跟随系统 · 深色模式</text>
<text x="540" y="250" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#595959">文字 #F0F0F0 · 背景 #1F1F1F · 边框 #303030</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 2 · 同一窗口的浅色 / 深色对照：结构一致，只替换色板</p>

## 技术架构

整个工具分为两个核心引擎：**OCR 引擎**和**翻译引擎**，它们通过简洁的架构协同工作。

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="技术架构：OCR 引擎与翻译引擎">
<defs>
<marker id="f3-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#8C8C8C"/></marker>
</defs>
<rect x="1" y="1" width="718" height="398" rx="12" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="32" y="38" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="15" font-weight="700" fill="#262626">技术架构 · 截图 → 识别 → 翻译</text>
<text x="688" y="38" text-anchor="end" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">全程离线 · 本机处理</text>
<line x1="32" y1="54" x2="688" y2="54" stroke="#F0F0F0"/>
<!-- Left panel header -->
<rect x="32" y="70" width="10" height="10" rx="2" fill="#1677FF"/>
<text x="50" y="79" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">OCR 引擎</text>
<rect x="238" y="66" width="114" height="22" rx="11" fill="#F5F5F5"/>
<text x="295" y="81" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">ncnn 本地推理</text>
<!-- Left rows -->
<rect x="32" y="100" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="60" cy="126" r="11" fill="#1677FF"/>
<text x="60" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">1</text>
<text x="80" y="121" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">文字检测</text>
<text x="336" y="121" text-anchor="end" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">DBNet · det</text>
<text x="80" y="140" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">定位图片中的文字区域</text>
<line x1="60" y1="152" x2="60" y2="162" stroke="#D9D9D9" stroke-width="1.5"/>
<rect x="32" y="162" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="60" cy="188" r="11" fill="#1677FF"/>
<text x="60" y="192" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">2</text>
<text x="80" y="183" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">方向分类</text>
<text x="336" y="183" text-anchor="end" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">LCNet · cls</text>
<text x="80" y="202" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">判断文字方向是否需要旋转</text>
<line x1="60" y1="214" x2="60" y2="224" stroke="#D9D9D9" stroke-width="1.5"/>
<rect x="32" y="224" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="60" cy="250" r="11" fill="#1677FF"/>
<text x="60" y="254" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">3</text>
<text x="80" y="245" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">文字识别</text>
<text x="336" y="245" text-anchor="end" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">CRNN · rec</text>
<text x="80" y="264" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">将文字区域转换为文本字符串</text>
<!-- Right panel header -->
<rect x="368" y="70" width="10" height="10" rx="2" fill="#52C41A"/>
<text x="386" y="79" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">翻译引擎</text>
<rect x="568" y="66" width="120" height="22" rx="11" fill="#F5F5F5"/>
<text x="628" y="81" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">本机 HTTP 服务</text>
<!-- Right rows -->
<rect x="368" y="100" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="126" r="4" fill="#52C41A"/>
<text x="410" y="121" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">MTranServer</text>
<text x="410" y="140" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">内嵌翻译服务，按需启动</text>
<rect x="368" y="162" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="188" r="4" fill="#52C41A"/>
<text x="410" y="183" font-family="ui-monospace, Consolas, monospace" font-size="12" font-weight="600" fill="#262626">POST /translate · :8989</text>
<text x="410" y="202" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">本机回环调用，无需联网</text>
<rect x="368" y="224" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="250" r="4" fill="#52C41A"/>
<text x="410" y="245" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">中英互译</text>
<text x="410" y="264" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">源语言自动检测</text>
<!-- Bottom flow bar -->
<rect x="32" y="292" width="656" height="52" rx="8" fill="#F5F5F5"/>
<rect x="48" y="302" width="132" height="32" rx="16" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="114" y="323" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#262626">识别文本</text>
<line x1="190" y1="318" x2="226" y2="318" stroke="#8C8C8C" stroke-width="1.5" marker-end="url(#f3-arrow)"/>
<text x="360" y="323" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">HTTP POST · localhost:8989</text>
<line x1="494" y1="318" x2="530" y2="318" stroke="#8C8C8C" stroke-width="1.5" marker-end="url(#f3-arrow)"/>
<rect x="540" y="302" width="132" height="32" rx="16" fill="#F6FFED" stroke="#B7EB8F"/>
<text x="606" y="323" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#389E0D">翻译结果</text>
<text x="360" y="372" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">ncnn 20241226 · OpenCV 4.11 · Clipper2 · MTranServer</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 3 · 双引擎架构：左为三段式 OCR 管线，右为本机翻译服务，底部为数据流向</p>

### OCR 流程

OCR 引擎基于 PP-OCRv6 Tiny 模型，通过 ncnn 框架在 C++ 中直接推理，三步完成文字识别：

1. **文字检测** — `PP_OCRv6_tiny_det`（DBNet）定位图片中的文字区域
2. **方向分类** — `PP_LCNet_x0_25_textline_ori` 判断文字是正向还是需要旋转
3. **文字识别** — `PP_OCRv6_tiny_rec`（CRNN）将文字区域转换为文本字符串

### 翻译流程

识别完成后，文本通过 HTTP POST 发送到本机的 MTranServer（`localhost:8989/translate`），由翻译引擎完成中英互译。整个过程无需联网，所有数据都在本机处理。

## 从源码构建

### 前置条件

- Windows x64 系统
- Visual Studio 2022（需要 MSVC + CMake 支持）

### 一键构建

```bat
build_native.bat
```

构建脚本会自动完成以下步骤：

1. 调用 VS2022 开发者命令行
2. 运行 CMake 配置（Release 模式）
3. 编译生成 `ChineseOCRLiteDesktop.exe`

CMake 构建后会自动将 `models/` 和 `ppocrv6_config.json` 复制到产物目录，无需手动操作。

### 依赖说明

好消息是，所有核心依赖都已经包含在仓库中：

- **ncnn 20241226** 和 **OpenCV 4.11** 静态库在 `third_party/` 目录
- **Clipper2** 多边形裁剪库在 `ppocrv6_engine/3rdparty/clipper2/`
- 翻译资源（`mtranserver.exe`、模型、配置）已内置于发布版 exe

你只需要一个 VS2022，就能从源码构建出完整的工具。

## 自检功能

工具内置了自检命令，方便验证安装是否正常：

```bat
ChineseOCRLiteDesktop.exe --selftest
```

退出码含义：

| 退出码 | 含义 |
|--------|------|
| `0` | 通过：OCR 模型加载 + 中英翻译均正常 |
| `3` | 异常：OCR 模型文件缺失 |
| `4` | 异常：OCR 引擎初始化失败 |
| `5` | 异常：翻译引擎启动失败 |
| `6` | 异常：翻译结果为空 |

## 使用方式

### 下载

<div style="border:1px solid #E8E8E8;border-radius:12px;padding:24px;margin:24px 0;background:#FFFFFF;">
<div style="font-size:16px;font-weight:700;color:#262626;margin-bottom:4px;">PP-OCRv6 Desktop · 最新版下载</div>
<div style="font-size:13px;color:#8C8C8C;margin-bottom:16px;">单文件 · 免安装 · 约 250MB · Windows x64</div>
<div style="margin-bottom:16px;">
<a href="https://github.com/SeanWang114514/PP-OCRv6-Desktop/releases" style="display:inline-block;background:#1677FF;color:#FFFFFF;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin-right:12px;">前往 Releases 下载</a>
<a href="https://github.com/SeanWang114514/PP-OCRv6-Desktop" style="display:inline-block;background:#FFFFFF;color:#595959;padding:9px 24px;border-radius:6px;text-decoration:none;font-size:14px;border:1px solid #D9D9D9;">查看项目源码</a>
</div>
<div style="font-size:12px;color:#8C8C8C;">下载 <code>ChineseOCRLiteDesktop.exe</code> 后双击即可运行，源码遵循上游项目的开源协议，模型遵循 PaddlePaddle 许可条款。</div>
</div>

### 快速上手

1. 双击运行 `ChineseOCRLiteDesktop.exe`
2. 按 `Ctrl + Alt + S` 截图（可在设置中修改快捷键）
3. 框选需要识别的区域
4. 等待 OCR 识别完成
5. 查看结果，支持一键翻译

### 使用场景

- 阅读外文文档时快速翻译
- 从图片中提取文字，告别手打
- 查看论文截图中的公式和数据
- 翻译软件界面、菜单、报错信息
- 快速记录白板、PPT 上的内容

## 项目结构

```
PP-OCRv6-Desktop/
├── src/                          # 主程序源码
│   └── main.cpp                  # Win32 GUI + OCR + 翻译 + 托盘
├── ppocrv6_engine/               # PP-OCRv6 ncnn C++ 推理引擎
│   ├── ocr_engine.cpp/h          # OCR 引擎入口
│   ├── db_net.cpp/h              # 文字检测网络
│   ├── angle_net.cpp/h           # 方向分类网络
│   ├── crnn_net.cpp/h            # 文字识别网络
│   └── 3rdparty/                 # Clipper2 + plog
├── models/                       # OCR 模型文件
├── third_party/                  # 预编译静态库 (ncnn, OpenCV)
├── CMakeLists.txt                # CMake 构建配置
└── build_native.bat              # 一键构建脚本
```

## 开源与致谢

本项目站在这些优秀开源项目的肩膀上：

- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) — PP-OCR 系列模型
- [Tencent/ncnn](https://github.com/Tencent/ncnn) — 高性能神经网络推理框架
- [Avafly/PaddleOCR-ncnn-CPP](https://github.com/Avafly/PaddleOCR-ncnn-CPP) — PP-OCRv6 ncnn C++ 推理集成参考
- [OpenCV](https://opencv.org/) — 计算机视觉库
- [Clipper2](http://www.angusj.com/clipper2/) — 多边形裁剪库

## 写在最后

做这个工具的初衷很简单：我想要一个**打开就能用**的 OCR + 翻译工具。不需要装 Python，不需要配置环境，不需要联网，不需要注册账号。双击 exe，截图，识别，翻译，完成。

如果你也有类似的需求，欢迎去 [GitHub](https://github.com/SeanWang114514/PP-OCRv6-Desktop) 下载体验，也欢迎提 issue 或 star 支持一下。
