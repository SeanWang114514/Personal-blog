---
layout:     post
title:      "Note Studio：把 PDF 改字、OCR 和语音识别装进一个本地工作台"
subtitle:   "八种常见格式就地打开、改完写回原文件；识别在本机推理，文件不出本机"
date:       2026-09-19 22:00:00
author:     "Sean Wang"
header-img: "img/post-bg-web.jpg"
catalog: true
tags:
    - 工具
    - PDF
    - Electron
    - React
    - OCR
---

> 一个基于 React + Electron 的本地文档工作台：PDF 能像 Word 一样逐字改，批注文本框自带格式栏，手写 OCR 与语音识别都在本机推理 —— 改完直接写回原文件。

<div style="display:flex;gap:12px;flex-wrap:wrap;margin:24px 0 0;">
<a href="https://github.com/SeanWang114514/note-studio" style="display:inline-flex;align-items:center;gap:8px;background:#24292e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.2);">
<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
Star on GitHub
</a>
<a href="https://github.com/SeanWang114514/note-studio/releases" style="display:inline-flex;align-items:center;gap:8px;background:#1677FF;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.2);">
⬇ 下载 Windows exe（251MB）
</a>
</div>

<div style="border:1px solid #E8E8E8;border-left:4px solid #1677FF;border-radius:8px;padding:16px 20px;margin:24px 0;background:#F0F5FF;">
<div style="font-size:15px;font-weight:600;color:#262626;margin-bottom:4px;">快速下载</div>
<div style="font-size:13px;color:#595959;">在 <a href="https://github.com/SeanWang114514/note-studio/releases" style="color:#1677FF;">GitHub Releases</a> 下载 <code>Note-Studio-0.1.13-Windows.exe</code>，单文件、免安装，双击即用（约 251MB）；同一 Release 下还有 Android 版 <code>app-debug.apk</code>。项目源码：<a href="https://github.com/SeanWang114514/note-studio" style="color:#1677FF;">note-studio</a>。</div>
</div>

<!--more-->

## 为什么做这个

"帮我改一个字"听起来是文档处理里最基本的需求，但真做起来处处是墙。

只读的阅读器改不了内容；系统自带的预览看完就关，批注也存不回文件。能真正编辑 PDF 的商业软件是订阅制，一年几百块，而且导出的文件在别的阅读器里打开，字体和排版经常变样。在线工具倒是免费，但第一步就要把文件传上去——如果手上是合同、论文、成绩单或者身份证扫描件，光是想一想"这份东西要进别人的服务器"，多半就放弃了。

至于手写识别和语音输入，那又是另外两个工具：要联网、要注册、有调用次数限制，识别完还要手动把文字复制回来。

所以我想做一个**打开就能改、改完就存回原文件、识别在本机跑**的工作台。这就是 Note Studio。

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 374" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Note Studio 三步：打开八种格式、直接编辑、写回原文件">
<defs>
<marker id="ns1-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#BFBFBF"/></marker>
</defs>
<rect x="1" y="1" width="718" height="372" rx="12" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="32" y="38" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="20" font-weight="700" fill="#262626">Note Studio</text>
<text x="32" y="60" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" fill="#8C8C8C">本地文档工作台 · 八种格式 · 编辑 / 批注 / 识别</text>
<rect x="534" y="24" width="154" height="30" rx="15" fill="#E6F4FF"/>
<text x="611" y="44" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#1677FF">Windows · Web · Android</text>
<line x1="32" y1="76" x2="688" y2="76" stroke="#F0F0F0"/>
<!-- Step 1 -->
<rect x="32" y="96" width="202" height="180" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="52" y="124" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#8C8C8C">STEP 01</text>
<rect x="52" y="136" width="44" height="44" rx="8" fill="#E6F4FF"/>
<rect x="62" y="147" width="24" height="28" rx="2" fill="none" stroke="#1677FF" stroke-width="1.5"/>
<line x1="67" y1="155" x2="81" y2="155" stroke="#1677FF" stroke-width="1.5"/>
<line x1="67" y1="162" x2="81" y2="162" stroke="#1677FF" stroke-width="1.5"/>
<line x1="67" y1="169" x2="75" y2="169" stroke="#1677FF" stroke-width="1.5"/>
<text x="52" y="200" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">打开常见文档</text>
<text x="52" y="221" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">PDF / Word / Markdown</text>
<text x="52" y="240" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">Excel / EPUB / TXT</text>
<text x="52" y="259" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">PPT / CAJ（白板批注）</text>
<!-- Step 2 -->
<rect x="259" y="96" width="202" height="180" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="279" y="124" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#8C8C8C">STEP 02</text>
<rect x="279" y="136" width="44" height="44" rx="8" fill="#E6F4FF"/>
<line x1="301" y1="146" x2="301" y2="170" stroke="#1677FF" stroke-width="2"/>
<line x1="295" y1="146" x2="307" y2="146" stroke="#1677FF" stroke-width="2"/>
<line x1="295" y1="170" x2="307" y2="170" stroke="#1677FF" stroke-width="2"/>
<text x="279" y="200" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">直接改内容</text>
<text x="279" y="221" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">PDF 逐字编辑 / 批注</text>
<text x="279" y="240" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">文本框格式栏</text>
<text x="279" y="259" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">新建一页 / 撤销</text>
<!-- Step 3 -->
<rect x="486" y="96" width="202" height="180" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="506" y="124" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#8C8C8C">STEP 03</text>
<rect x="506" y="136" width="44" height="44" rx="8" fill="#E6F4FF"/>
<line x1="528" y1="145" x2="528" y2="163" stroke="#1677FF" stroke-width="2"/>
<polyline points="521,156 528,164 535,156" fill="none" stroke="#1677FF" stroke-width="2"/>
<line x1="516" y1="170" x2="540" y2="170" stroke="#1677FF" stroke-width="2"/>
<text x="506" y="200" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">落回原文件</text>
<text x="506" y="221" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">写回 PDF / .docx</text>
<text x="506" y="240" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">批注随文件保存</text>
<text x="506" y="259" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">OCR / 语音插到光标</text>
<line x1="238" y1="186" x2="255" y2="186" stroke="#BFBFBF" stroke-width="1.5" marker-end="url(#ns1-arrow)"/>
<line x1="465" y1="186" x2="482" y2="186" stroke="#BFBFBF" stroke-width="1.5" marker-end="url(#ns1-arrow)"/>
<rect x="32" y="296" width="656" height="52" rx="8" fill="#F5F5F5"/>
<text x="360" y="327" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#595959">识别在本机推理 · 批注随文件走 · 没有一步需要联网上传</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 1 · 从打开到落盘的三个动作，全程在本机完成</p>

## 它能打开什么

支持八种常见格式，每种都对应一个专门写的视图，而不是"统一转成 HTML 再说"：

| 格式 | 打开后是什么 | 能做的编辑 |
|------|--------------|------------|
| **PDF** | 连续滚动阅读器：即时缩放、单页 / 连续切换、缩略图栏、文字层可选可搜 | 逐字编辑、批注、文本框、写回 PDF |
| **Word（.doc / .docx）** | 排版保真渲染 | 改文字、批注、保存回 `.docx` |
| **Markdown（.md）** | 块编辑器 + 实时预览 | 改文字，防抖自动保存 |
| **纯文本（.txt）** | 纯文本视图 | 光标处插入、换页符分页 |
| **Excel（.xls / .xlsx）** | 工作表视图 | 改单元格、新建工作表 |
| **EPUB** | 章节渲染，图片与链接照常工作 | 改正文、追加章节 |
| **PPT（.ppt / .pptx）** | 可批注白板 | 批注、翻页 |
| **CAJ** | 占位视图 + 白板 | 批注（知网专有格式，需先转 PDF 才能预览） |

除此之外还有几件日常会用到的事：

- **最近打开**：主页保留最近五个文件的卡片，下次直接点开；文件权限过期会提示重新授权，而不是默默失败。
- **标签页**：多个文件叠着开，不用来回找窗口。
- **文字识别 / 语音识别**：两个按钮都在右上角，识别结果直接插进文档光标处。

## 三种「改文档」的手感

### 一、PDF 改字，像 Word 一样

这是整个项目里最花功夫的部分。PDF 在格式上根本没有"段落"这个概念，只有一堆各自独立定位的文本片段，所以大多数工具的选择是——不给你改，或者让你贴一个文本框盖上去。

Note Studio 走的是另一条路：把相邻的行按字号、行距、对齐方式**自动聚合成一个连续段落**，然后在段落上叠一个精确对齐的编辑框。

- **单击左键**在文字任意位置定位光标，直接输入、退格删除，所见即所得；
- **鼠标拖拽跨行多选**，选中的文字可以整体删除或替换；
- **段落内文字是连起来的**：回车在段落内换行，不会出现"每行一个独立编辑框"的割裂感；
- 字体、字号、加粗、斜体、下划线、颜色、左中右对齐都在工具栏上；
- `Enter` 换行、`Esc` 取消、`Ctrl + S` 保存，点页面别处自动提交（和 Word 一个脾气）。

保存的时候**是真的写回 PDF 文件本身**，不是存一份"编辑记录"下次再叠上去：纯 ASCII 文字用矢量字体直接写进内容流，中文和任意系统字体则渲染成高清 PNG 嵌入（先用白底覆盖原文，再画上新文字）。任何阅读器打开都能看到结果。

### 二、批注文本框，自带 Word 式格式栏

点工具栏的「文本框」按钮，工具条会**自动多出一行文字格式栏**——字体、字号、加粗 / 斜体 / 下划线、对齐、五个色块加自定义颜色。

这里有个值得说的设计取舍：**选中某个文本框时**，格式栏改的是那个框（和 Word 改选区一样）；**没选中时**，它改的是"新建文本框的默认样式"，栏首会写清楚现在改的是哪一种。而且这排控件是常驻的，点画布、点别处都不会把它关掉。

之所以强调这点，是因为它最早藏在"再点一次工具按钮 / 双击 / 右键"后面，用户根本找不到，反馈就是"没有 Word 那样能选字体字号的界面"。功能都在，但发现不了就等于没有——这条教训现在写进了项目文档里。

### 三、「新建一页」和「删除新建页」

给文档加一页，听起来是个按钮的事，但"一页"在各格式里的含义完全不同：

| 格式 | 「新建一页」做的 | 「删除新建页」做的 |
|------|------------------|--------------------|
| PDF | 末尾追加一张真实空白页（改文档结构） | 删掉末尾那一页 |
| Word（.docx） | 文末插入 Word 分页符 | 移掉文末那个分页标记 |
| Markdown | 追加 `\pagebreak` 分页块 + 空段落 | 按块 id 移掉这两块 |
| EPUB | 书末追加一个新章节（登记进 OPF） | 把新章节移出书末，OPF 里也不再登记 |
| Excel | 新建一张工作表 | 删掉那张工作表 |
| 纯文本 | 在光标处插入换页符 `^L` | 移除刚插入的换页符 |
| PPT / CAJ / 未知 | 白板后面追加一张空白页 | 页数退回"本次会话第一次加页前"的值 |

配套的「删除新建页」有两个关键约束：

**只删自己这一会话里新建的页，文件原有的页一张都不会少。** 没点过「新建一页」时按钮是灰的；白板格式还额外受"文件原有页数"这个下界保护。而且是后进先出——连点两次新建就要连点两次删除，换文件后记账清零。

**二级确定，但不弹窗。** 弹一个模态框问"确定要删除吗"是最容易让人烦躁的做法，尤其是删除本身只是撤销自己刚做的操作。所以这里用的是"上膛"：

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 252" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="删除新建页的两级确认：置灰、上膛、执行">
<defs>
<marker id="ns2-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#BFBFBF"/></marker>
</defs>
<rect x="1" y="1" width="718" height="250" rx="12" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="32" y="38" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="15" font-weight="700" fill="#262626">「删除新建页」的两级确认</text>
<text x="688" y="38" text-anchor="end" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">误点一下不会删掉任何东西</text>
<line x1="32" y1="54" x2="688" y2="54" stroke="#F0F0F0"/>
<rect x="32" y="86" width="200" height="56" rx="8" fill="#FAFAFA" stroke="#F0F0F0"/>
<text x="132" y="120" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" fill="#BFBFBF">删除新建页</text>
<text x="132" y="166" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">没点过「新建一页」→ 置灰</text>
<rect x="260" y="86" width="200" height="56" rx="8" fill="#FFF1F0" stroke="#FFA39E"/>
<text x="360" y="120" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#CF1322">确认删除</text>
<text x="360" y="166" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">第一次点击 → 红底「上膛」</text>
<rect x="488" y="86" width="200" height="56" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="588" y="120" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" fill="#262626">已删除 1 页</text>
<text x="588" y="166" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">3 秒内再点一次 → 真正执行</text>
<line x1="236" y1="114" x2="254" y2="114" stroke="#BFBFBF" stroke-width="1.5" marker-end="url(#ns2-arrow)"/>
<line x1="464" y1="114" x2="482" y2="114" stroke="#BFBFBF" stroke-width="1.5" marker-end="url(#ns2-arrow)"/>
<rect x="32" y="192" width="656" height="44" rx="8" fill="#F5F5F5"/>
<text x="360" y="219" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">失焦 / 超过 3 秒 / 按钮被置灰 → 自动收回，退回灰色状态</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 2 · 两级确认的三个状态：置灰、上膛、执行</p>

第一次点击只是"上膛"——按钮变成红底的「确认删除」，**3 秒内再点一次**才真的执行；期间点到别处（失焦）、超时、按钮被置灰，都会自动收回。挨着「新建一页」的按钮误点一下，什么都不会发生。

## 本机 AI：手写就认，说话就写字

两个识别功能都是纯本地的，不联网、不上传、没有调用次数。

### 手写 / 图片 OCR

点右上角「文字识别」弹出画板：可以直接用手写（鼠标、触屏、数位板都行），也可以 `Ctrl + V` 粘贴截图、或者上传一张图片识别印刷文字。

- 模型可选：**PP-OCRv5_mobile**（轻量通用，适合手写）或 **PP-OCRv6 small**（精度更高，适合印刷体）；
- 推理在**本机浏览器里跑**（PaddleOCR.js + ONNX Runtime Web），图片不出本机，模型已内置到 `public/models/`；
- 识别完点「插入到文档」，文字会**完整插入到打开弹窗前光标所在的位置**——没选光标就插到文末，Excel 写进当前选中的单元格；
- 还有两个开关：「整理为一行」（把多行合并成一行）和「去除空格」，对显示、复制、插入同时生效。

手写识别对书写工整度敏感，写大一点、笔画清楚一些，效果明显更好。

### 离线语音识别

点「语音识别」弹出一个小窗口：中间是麦克风按钮，下方一排竖向滚动条实时显示音量与频率分布。

- 停止说话约 **1.6 秒**自动结束录音并输出结果（也可以手动点麦克风，或到 60 秒上限）；
- 识别文字直接显示在弹窗里，**点着就能改**，不需要额外的编辑按钮；
- 两个模型可选：**Vosk**（默认，vosk-browser + Kaldi 编译成 WebAssembly，浏览器内离线识别、流式出中间结果）——中文小模型约 42MB 已内置，开箱即用；**Qwen3-ASR**（官方 `qwen-asr` 包 + FastAPI 本地服务，精度更高，CPU / GPU 都能跑）；
- 音频不出本机；点「发送」同样插到光标处。

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 386" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="技术架构：文档引擎、本机 AI 引擎与三端产物">
<defs>
<marker id="ns3-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#8C8C8C"/></marker>
</defs>
<rect x="1" y="1" width="718" height="384" rx="12" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="32" y="38" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="15" font-weight="700" fill="#262626">技术架构 · 三端同源，AI 在本机推理</text>
<text x="688" y="38" text-anchor="end" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#8C8C8C">全程离线 · 文件不上传</text>
<line x1="32" y1="54" x2="688" y2="54" stroke="#F0F0F0"/>
<!-- Left panel -->
<rect x="32" y="66" width="10" height="10" rx="2" fill="#1677FF"/>
<text x="50" y="79" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">文档引擎</text>
<rect x="238" y="66" width="114" height="22" rx="11" fill="#F5F5F5"/>
<text x="295" y="81" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">浏览器内运行</text>
<rect x="32" y="100" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="60" cy="126" r="11" fill="#1677FF"/>
<text x="60" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">1</text>
<text x="80" y="121" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">PDF 渲染</text>
<text x="336" y="121" text-anchor="end" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">pdfjs-dist</text>
<text x="80" y="140" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">连续滚动 · 惰性渲染 · 即时缩放</text>
<line x1="60" y1="152" x2="60" y2="162" stroke="#D9D9D9" stroke-width="1.5"/>
<rect x="32" y="162" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="60" cy="188" r="11" fill="#1677FF"/>
<text x="60" y="192" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">2</text>
<text x="80" y="183" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">PDF 写回</text>
<text x="336" y="183" text-anchor="end" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">pdf-lib</text>
<text x="80" y="202" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">改文档结构，不是叠一层覆盖</text>
<line x1="60" y1="214" x2="60" y2="224" stroke="#D9D9D9" stroke-width="1.5"/>
<rect x="32" y="224" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="60" cy="250" r="11" fill="#1677FF"/>
<text x="60" y="254" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">3</text>
<text x="80" y="245" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">格式解析</text>
<text x="336" y="245" text-anchor="end" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">mammoth · SheetJS</text>
<text x="80" y="264" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">docx / xlsx / epub / markdown</text>
<!-- Right panel -->
<rect x="368" y="66" width="10" height="10" rx="2" fill="#52C41A"/>
<text x="386" y="79" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">本机 AI</text>
<rect x="568" y="66" width="120" height="22" rx="11" fill="#F5F5F5"/>
<text x="628" y="81" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">离线推理</text>
<rect x="368" y="100" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="126" r="4" fill="#52C41A"/>
<text x="410" y="121" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">手写 / 图片 OCR</text>
<text x="410" y="140" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">PaddleOCR.js · ONNX Runtime Web</text>
<rect x="368" y="162" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="188" r="4" fill="#52C41A"/>
<text x="410" y="183" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">离线语音识别</text>
<text x="410" y="202" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">vosk-browser（WASM，模型内置）</text>
<rect x="368" y="224" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="250" r="4" fill="#52C41A"/>
<text x="410" y="245" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">高精度 ASR（可选）</text>
<text x="410" y="264" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">Qwen3-ASR 本地 FastAPI 服务</text>
<!-- Bottom bar -->
<rect x="32" y="292" width="656" height="52" rx="8" fill="#F5F5F5"/>
<rect x="48" y="302" width="180" height="32" rx="16" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="138" y="323" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#262626">Web 浏览器</text>
<line x1="238" y1="318" x2="258" y2="318" stroke="#8C8C8C" stroke-width="1.5" marker-end="url(#ns3-arrow)"/>
<rect x="268" y="302" width="180" height="32" rx="16" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="358" y="323" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#262626">Windows exe</text>
<line x1="458" y1="318" x2="478" y2="318" stroke="#8C8C8C" stroke-width="1.5" marker-end="url(#ns3-arrow)"/>
<rect x="488" y="302" width="180" height="32" rx="16" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="578" y="323" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#262626">Android APK</text>
<text x="360" y="366" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">同一份 dist/ 产物 · Electron portable · Capacitor</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 3 · 两块引擎都跑在本机，同一份代码产出 Web / Windows / Android 三个形态</p>

## 一套代码，三端交付

项目主体是 React + Vite，外面套两层壳：

- **Web**：`npm run dev` 或 `npm run build` 直接跑，浏览器里就能用（只是没有本地文件写入权限时，保存会退化）。
- **Windows**：Electron + electron-builder 打成 **portable 单文件 exe**，双击即用、免安装。
- **Android**：Capacitor 打包成 APK，触屏环境会自动启用一套独立的手势逻辑——单指滑动翻页、松手带惯性、按屏幕分辨率自动"适合宽度"，横竖屏切换后重新适配，批注栏默认折叠把宽度让给文档。桌面端（鼠标 + 键盘）完全不受影响。

发版流程也是自动的：推一个 `v*` 标签，GitHub Actions 上三条流水线并行跑（Windows exe、Android debug APK、Android release APK），产物直接挂到 Release 上。

### 单文件 exe 的启动速度是设计出来的

portable 形态是"自解压"的：**每次双击都要先把整包解压到临时目录再启动，退出后再删掉**，所以启动耗时几乎等于「解压耗时 + Electron 启动耗时」。当前配置专门为此做了四件事，实测（本机 NVMe SSD）：

| 形态 | 启动到窗口可见 |
|------|----------------|
| `Note-Studio-*-Windows.exe`（单文件便携版） | **2.2 ~ 2.6 s** |
| `win-unpacked/Note Studio.exe`（免解压目录版） | **1.2 ~ 1.5 s** |

1. `compression: "store"` —— 不压缩载荷。LZMA 解压大约 3 MB/s，一旦压缩，启动要 30 秒以上。
2. `portable.useZip: true` —— 走 NSIS 自带的 `File /r` 写文件，而不是 7z 插件解压（实测解压 1.87 s → 0.1 ~ 0.6 s）。
3. `electronLanguages: ["zh-CN", "en-US"]` —— 只保留两种语言包。
4. `files` 里的一串排除项 —— 渲染层依赖已经被 Vite 打进 `dist/`，`node_modules` 不需要进包；调试符号、未被引用的第三方副本也一并排掉。

改动其中任意一条，启动都会明显变慢。另外：全新构建出来的 exe 第一次运行时，Windows Defender 会先对新文件做一次扫描，可能耗时十几秒；从第二次起才是上表的时间。

## 界面：按 Apple HIG 重做了一遍

功能齐了之后，界面又整个重做了一遍，参照的是 Apple Human Interface Guidelines：

- **层级靠材质与描边，不靠重阴影**：侧边栏和工具栏用 vibrancy 半透明材质，内容区用标准背景，浮层用 popover 材质 + 一层柔和投影；
- **控件尺寸对齐规范**：常规控件高 28pt，圆角 6 / 8 / 10 / 12 形成梯度，命中区不小于 28×28；窄屏（手机）单独一档，触控目标放大到 40pt 方形；
- **强调色只用于"可交互 / 已选中"**：选中态、焦点环和主按钮用系统蓝，其余一律用中性色体系；
- **明暗两套主题跟随系统**，不需要在应用里切来切去；
- **面板可以自由缩放和折叠**：侧边栏、缩略图栏、批注栏都能拖宽、折叠收起，把屏幕让给文档；
- **批注层支持鼠标框选**：一次框住多条批注，整组拖动或删除。

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="浅色与深色外观对照：结构完全一致，只替换色板">
<!-- Light -->
<rect x="8" y="8" width="344" height="264" rx="12" fill="#FFFFFF" stroke="#D5D5D9"/>
<circle cx="30" cy="28" r="3.5" fill="#FF5F57"/>
<circle cx="42" cy="28" r="3.5" fill="#FEBC2E"/>
<circle cx="54" cy="28" r="3.5" fill="#28C840"/>
<text x="70" y="33" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#000000">Note Studio</text>
<rect x="280" y="18" width="56" height="22" rx="11" fill="#F2F2F7"/>
<text x="308" y="33" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8E8E93">浅色</text>
<line x1="24" y1="46" x2="336" y2="46" stroke="#E5E5EA"/>
<rect x="24" y="56" width="78" height="200" rx="8" fill="#F2F2F7"/>
<rect x="34" y="80" width="58" height="8" rx="4" fill="#007AFF"/>
<rect x="34" y="98" width="58" height="8" rx="4" fill="rgba(60,60,67,0.16)"/>
<rect x="34" y="116" width="58" height="8" rx="4" fill="rgba(60,60,67,0.16)"/>
<rect x="34" y="134" width="58" height="8" rx="4" fill="rgba(60,60,67,0.16)"/>
<rect x="112" y="56" width="168" height="200" rx="8" fill="#FFFFFF" stroke="#E5E5EA"/>
<rect x="128" y="76" width="110" height="9" rx="4" fill="rgba(0,0,0,0.72)"/>
<rect x="128" y="98" width="136" height="7" rx="3.5" fill="rgba(60,60,67,0.24)"/>
<rect x="128" y="114" width="136" height="7" rx="3.5" fill="rgba(60,60,67,0.24)"/>
<rect x="128" y="130" width="96" height="7" rx="3.5" fill="rgba(60,60,67,0.24)"/>
<rect x="126" y="146" width="140" height="24" rx="6" fill="#007AFF" fill-opacity="0.12" stroke="#007AFF" stroke-width="1.5"/>
<text x="136" y="162" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="10" font-weight="600" fill="#007AFF">编辑中</text>
<rect x="128" y="184" width="136" height="7" rx="3.5" fill="rgba(60,60,67,0.24)"/>
<rect x="128" y="200" width="80" height="7" rx="3.5" fill="rgba(60,60,67,0.24)"/>
<rect x="290" y="56" width="46" height="200" rx="8" fill="#F2F2F7"/>
<rect x="296" y="68" width="34" height="40" rx="6" fill="#FFFFFF" stroke="#E5E5EA"/>
<rect x="301" y="78" width="24" height="5" rx="2.5" fill="rgba(60,60,67,0.28)"/>
<rect x="301" y="89" width="16" height="5" rx="2.5" fill="rgba(60,60,67,0.16)"/>
<rect x="296" y="116" width="34" height="40" rx="6" fill="#FFFFFF" stroke="#E5E5EA"/>
<rect x="301" y="126" width="24" height="5" rx="2.5" fill="rgba(60,60,67,0.28)"/>
<rect x="301" y="137" width="20" height="5" rx="2.5" fill="rgba(60,60,67,0.16)"/>
<text x="180" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">侧边栏 #F2F2F7 · 强调色 #007AFF · 正文 #000000</text>
<!-- Dark -->
<rect x="368" y="8" width="344" height="264" rx="12" fill="#1C1C1E" stroke="#545458"/>
<circle cx="390" cy="28" r="3.5" fill="#FF5F57"/>
<circle cx="402" cy="28" r="3.5" fill="#FEBC2E"/>
<circle cx="414" cy="28" r="3.5" fill="#28C840"/>
<text x="430" y="33" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#FFFFFF">Note Studio</text>
<rect x="640" y="18" width="56" height="22" rx="11" fill="#2C2C2E"/>
<text x="668" y="33" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#98989D">深色</text>
<line x1="384" y1="46" x2="696" y2="46" stroke="#48484A"/>
<rect x="384" y="56" width="78" height="200" rx="8" fill="#2A2A2C"/>
<rect x="394" y="80" width="58" height="8" rx="4" fill="#0A84FF"/>
<rect x="394" y="98" width="58" height="8" rx="4" fill="rgba(235,235,245,0.24)"/>
<rect x="394" y="116" width="58" height="8" rx="4" fill="rgba(235,235,245,0.24)"/>
<rect x="394" y="134" width="58" height="8" rx="4" fill="rgba(235,235,245,0.24)"/>
<rect x="472" y="56" width="168" height="200" rx="8" fill="#2C2C2E" stroke="#48484A"/>
<rect x="488" y="76" width="110" height="9" rx="4" fill="rgba(255,255,255,0.85)"/>
<rect x="488" y="98" width="136" height="7" rx="3.5" fill="rgba(235,235,245,0.3)"/>
<rect x="488" y="114" width="136" height="7" rx="3.5" fill="rgba(235,235,245,0.3)"/>
<rect x="488" y="130" width="96" height="7" rx="3.5" fill="rgba(235,235,245,0.3)"/>
<rect x="486" y="146" width="140" height="24" rx="6" fill="#0A84FF" fill-opacity="0.22" stroke="#0A84FF" stroke-width="1.5"/>
<text x="496" y="162" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="10" font-weight="600" fill="#4DA3FF">编辑中</text>
<rect x="488" y="184" width="136" height="7" rx="3.5" fill="rgba(235,235,245,0.3)"/>
<rect x="488" y="200" width="80" height="7" rx="3.5" fill="rgba(235,235,245,0.3)"/>
<rect x="650" y="56" width="46" height="200" rx="8" fill="#2A2A2C"/>
<rect x="656" y="68" width="34" height="40" rx="6" fill="#3A3A3C" stroke="#48484A"/>
<rect x="661" y="78" width="24" height="5" rx="2.5" fill="rgba(235,235,245,0.4)"/>
<rect x="661" y="89" width="16" height="5" rx="2.5" fill="rgba(235,235,245,0.22)"/>
<rect x="656" y="116" width="34" height="40" rx="6" fill="#3A3A3C" stroke="#48484A"/>
<rect x="661" y="126" width="24" height="5" rx="2.5" fill="rgba(235,235,245,0.4)"/>
<rect x="661" y="137" width="20" height="5" rx="2.5" fill="rgba(235,235,245,0.22)"/>
<text x="540" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">侧边栏 #2A2A2C · 强调色 #0A84FF · 正文 #FFFFFF</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 4 · 明暗两套外观：结构完全一致，只替换色板，跟随系统切换</p>

## 技术栈

- **前端**：React 18 + Vite 6，不用 Tailwind，样式是手写的两份 CSS（设计令牌 + HIG 外观层）
- **文档**：`pdfjs-dist`（渲染）、`pdf-lib`（写回）、`mammoth`（docx 读取）、`docx`、`xlsx`、`marked`
- **文字识别**：PaddleOCR.js + ONNX Runtime Web（PP-OCRv5_mobile / PP-OCRv6，本地推理）
- **语音识别**：`vosk-browser`（Kaldi WASM 离线）+ Qwen3-ASR（`qwen-asr` + FastAPI 本地服务，OpenAI 兼容接口）
- **桌面 / 移动**：Electron 36 + electron-builder（portable exe）、Capacitor 7（APK）
- **本地服务**：Python，`server/convert_server.py` 做文档转换，`server/qwen3_asr_server.py` 做语音识别与模型下载管理

```
src/
  lib/pdf/          PDF 引擎：加载 / 渲染 / 视图 / 坐标 / 文字编辑 / 写回
  lib/FileProcessor.js   文件系统、解析、保存的唯一入口
  lib/momentumScroll.js  移动端单指滑动 + 松手惯性
  lib/useNewPageUndo.js  「新建一页」的后进先出记账
  components/       批注按钮、面板分隔条、设置、语音识别弹窗…
server/             Python 本地服务
```

## 使用方式

### 下载

<div style="border:1px solid #E8E8E8;border-radius:12px;padding:24px;margin:24px 0;background:#FFFFFF;">
<div style="font-size:16px;font-weight:700;color:#262626;margin-bottom:4px;">Note Studio · 最新版下载</div>
<div style="font-size:13px;color:#8C8C8C;margin-bottom:16px;">单文件 · 免安装 · 约 251MB · Windows x64（另有 Android APK）</div>
<div style="margin-bottom:16px;">
<a href="https://github.com/SeanWang114514/note-studio/releases" style="display:inline-block;background:#1677FF;color:#FFFFFF;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin-right:12px;">前往 Releases 下载</a>
<a href="https://github.com/SeanWang114514/note-studio" style="display:inline-block;background:#FFFFFF;color:#595959;padding:9px 24px;border-radius:6px;text-decoration:none;font-size:14px;border:1px solid #D9D9D9;">查看项目源码</a>
</div>
<div style="font-size:12px;color:#8C8C8C;">下载 <code>Note-Studio-0.1.13-Windows.exe</code> 后双击即可运行，不会安装任何东西，也不会在注册表里留东西。</div>
</div>

### 快速上手

1. 双击运行 exe，主页会列出最近打开过的文件；
2. 「打开文件」选一份 PDF，默认按适合宽度铺开；
3. 直接在文字上点一下就能改；要加批注就选画笔 / 文本框；
4. `Ctrl + S` 保存，改动写回原文件；
5. 需要识别手写或说话输入，点右上角的两个按钮。

### 使用场景

- 改 PDF 里的错别字、金额、日期，改完直接发给别人，不用再转格式
- 在合同、论文、标书上做批注和圈画，批注跟着文件走
- 把手写笔记、白板照片、截图里的文字提取出来，直接插进文档
- 一边看资料一边口述笔记，语音直接落成文字
- 手机上看 PDF、划重点（APK 版）

## 开源与致谢

这个项目站在一堆优秀的开源库肩膀上，特别感谢：

- [pdf.js](https://github.com/mozilla/pdf.js) / [pdf-lib](https://github.com/Hopding/pdf-lib) —— PDF 渲染与写回的地基
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) 与 [PaddleOCR.js](https://github.com/PaddlePaddle/PaddleOCR) —— 中英文与手写识别模型
- [ONNX Runtime Web](https://onnxruntime.ai/) —— 让模型能在浏览器里跑起来
- [Vosk](https://alphacephei.com/vosk/) / [vosk-browser](https://github.com/ccoreilly/vosk-browser) —— 离线语音识别
- [Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR) —— 高精度语音识别
- [mammoth](https://github.com/mwilliamson/mammoth.js)、[SheetJS](https://sheetjs.com/)、[marked](https://github.com/markedjs/marked) —— 各格式的解析
- [Electron](https://www.electronjs.org/)、[Capacitor](https://capacitorjs.com/)、[Vite](https://vite.dev/)、[React](https://react.dev/)、[lucide](https://lucide.dev/) —— 打包与界面

## 写在最后

做这个工具的出发点很朴素：**我不想为了改 PDF 里的两个字，先把文件传到别人的服务器上。**

本地优先这件事，在文档处理这个场景里不是洁癖，是刚需——你手上的文件可能是一份合同、一张成绩单、一页病历，或者只是还没来得及备份的草稿。让它们始终待在自己的硬盘上，同时又能享受"AI 帮我认字、帮我听写"的便利，这就是 Note Studio 想站的位置。

目前 Windows 版更新到 **v0.1.13**：工具栏图标放大了一档、按钮盒调到 32px，PDF 与各格式的「新建一页 / 删除新建页」都齐了，移动端手势也稳了。后面还会继续打磨 PDF 编辑的细节和格式支持。

如果你也有类似的需求，欢迎去 [GitHub](https://github.com/SeanWang114514/note-studio) 下载体验，也欢迎提 issue 或 star 支持一下。
