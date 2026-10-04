---
layout:     post
title:      "Rime VMenu 全家桶：一个 v 键，把小狼毫变成输入套件"
subtitle:   "功能菜单 / 可视化设置窗口 / 剪贴板历史 / 常用语 / 前后鼻音模糊 / 下一个候选词预测 / 本地语音输入，全部离线，exe 与 zip 双格式发布"
date:       2026-09-30 08:00:00
author:     "Sean Wang"
header-img: "img/preview/rime-vmenu-suite.svg"
catalog: true
tags:
    - 工具
    - 输入法
    - Rime
    - 语音输入
    - Lua
---

> 把小狼毫（Weasel）升级成一套完整的输入工具箱：按 `v` 出功能菜单，可视化窗口管词库与配置，剪贴板历史随手调用，按住 `Ctrl+Win` 就能说话输入 —— 全程离线，不需要管理员权限。

<div style="display:flex;gap:12px;flex-wrap:wrap;margin:24px 0 0;">
<a href="https://github.com/SeanWang114514/weasel-vmenu-suite" style="display:inline-flex;align-items:center;gap:8px;background:#24292e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.2);">
<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
Star on GitHub
</a>
<a href="https://github.com/SeanWang114514/weasel-vmenu-suite/releases/tag/v1.0.0" style="display:inline-flex;align-items:center;gap:8px;background:#1677FF;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.2);">
⬇ 下载 exe 直装包（约 1.1GB）
</a>
</div>

<div style="border:1px solid #E8E8E8;border-left:4px solid #1677FF;border-radius:8px;padding:16px 20px;margin:24px 0;background:#F0F5FF;">
<div style="font-size:15px;font-weight:600;color:#262626;margin-bottom:4px;">快速下载</div>
<div style="font-size:13px;color:#595959;">项目地址：<a href="https://github.com/SeanWang114514/weasel-vmenu-suite" style="color:#1677FF;">SeanWang114514/weasel-vmenu-suite</a>　·　下载地址：<a href="https://github.com/SeanWang114514/weasel-vmenu-suite/releases/tag/v1.0.0" style="color:#1677FF;">Release v1.0.0</a>。两个包<b>功能完全一致</b>，任选其一：<code>RimeVMenu-Setup-1.0.0.exe</code>（双击直装）与 <code>RimeVMenu-1.0.0.zip</code>（解压后双击 <code>安装.bat</code>，也可被小狼毫官方 <code>rime-install.bat</code> 导入）。</div>
</div>

<!--more-->

## 为什么做这个

小狼毫（Weasel）本身的拼音方案（尤其是 [rime-ice](https://github.com/iDvel/rime-ice)）已经很能打了，但它交付给用户的是一套**需要自己动手的零件**：想加剪贴板历史要自己找补丁，想有个图形化设置窗口要自己改 yaml，想语音输入得再开一个工具。我用小狼毫的这几年，配置越攒越厚，每次换机器都要重来一遍。

于是我把常用的那些零件**缝成一整套**，装完就有完整的体验，不再需要逐条搜教程 —— 这就是 **Rime VMenu 全家桶**：

- 输入法里按一个 **`v`**，功能菜单就出来：设置窗口、剪贴板历史、快捷输入、常用语、原符号，全在候选栏里；
- 打字体验的三件小事一次补齐：候选框一行 9 个（`↓` 展开成 4×9 方格）、**上一个词猜下一个词**、**前后鼻音五对可单独开关**；
- 语音输入按住 `Ctrl+Win` 说话，松开就上屏 —— 本地推理，不联网、不注册、不计次数；
- 后台常驻三个小进程（守护、剪贴板同步、设置窗口），占用小到可以忽略；
- **两种发布格式功能完全一致**：exe 直装包和 rime 导入 zip，都带 971MB 的语音模型。

<div style="margin:24px 0 0;">
<svg style="width:100%;height:auto;display:block;" viewBox="0 0 720 374" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rime VMenu 全家桶架构：按 v 出五项功能菜单，后台常驻三个进程">
<defs>
<marker id="vm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#BFBFBF"/></marker>
</defs>
<rect x="1" y="1" width="718" height="372" rx="12" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="32" y="38" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="20" font-weight="700" fill="#262626">Rime VMenu 全家桶</text>
<text x="32" y="60" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" fill="#8C8C8C">小狼毫输入法增强套件 · 一个 v 键 · 全程离线</text>
<rect x="525" y="24" width="166" height="30" rx="15" fill="#E6F4FF"/>
<text x="608" y="44" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#1677FF">Windows · 小狼毫 Weasel</text>
<line x1="32" y1="76" x2="688" y2="76" stroke="#F0F0F0"/>
<!-- 左：按 v 出的功能菜单 -->
<rect x="32" y="70" width="10" height="10" rx="2" fill="#1677FF"/>
<text x="50" y="79" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">按 v 之后：候选一行 5 项</text>
<rect x="242" y="66" width="110" height="22" rx="11" fill="#F5F5F5"/>
<text x="297" y="81" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">librime + lua</text>
<rect x="32" y="96" width="320" height="38" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="42" y="120" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1677FF">1</text>
<text x="64" y="120" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">设置窗口</text>
<text x="116" y="120" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1677FF">2</text>
<text x="138" y="120" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">剪贴板</text>
<text x="190" y="120" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1677FF">3</text>
<text x="212" y="120" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">快捷输入</text>
<text x="276" y="120" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1677FF">4</text>
<text x="298" y="120" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">常用语</text>
<text x="32" y="152" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1677FF">5</text>
<text x="54" y="152" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">原符号</text>
<text x="130" y="152" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">回车 = 直接打出字母 v</text>
<circle cx="38" cy="176" r="3" fill="#1677FF"/>
<text x="50" y="180" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">候选框一行 9 个 · 按 ↓ 展开 4×9 方格</text>
<circle cx="38" cy="204" r="3" fill="#1677FF"/>
<text x="50" y="208" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">下一个候选词预测（bigram 二元统计）</text>
<circle cx="38" cy="232" r="3" fill="#1677FF"/>
<text x="50" y="236" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">前后鼻音五对模糊音，可逐对开关</text>
<circle cx="38" cy="260" r="3" fill="#1677FF"/>
<text x="50" y="264" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" fill="#262626">网址 / 路径智能标点（。→ . 、→ \）</text>
<!-- 右：常驻后台 -->
<rect x="368" y="70" width="10" height="10" rx="2" fill="#52C41A"/>
<text x="386" y="79" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="14" font-weight="600" fill="#262626">常驻后台</text>
<rect x="568" y="66" width="120" height="22" rx="11" fill="#F5F5F5"/>
<text x="628" y="81" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">合计约 19MB</text>
<rect x="368" y="100" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="126" r="4" fill="#52C41A"/>
<text x="410" y="121" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">VMenu.exe</text>
<text x="410" y="140" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">守护 · 剪贴板同步 · 开机自启（各约 1MB）</text>
<rect x="368" y="162" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="188" r="4" fill="#52C41A"/>
<text x="410" y="183" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">VMenuSettings.exe</text>
<text x="410" y="202" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">C# WinForms 设置窗口，v → 1 秒开（约 17MB）</text>
<rect x="368" y="224" width="320" height="52" rx="8" fill="#FFFFFF" stroke="#E8E8E8"/>
<circle cx="396" cy="250" r="4" fill="#52C41A"/>
<text x="410" y="245" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="13" font-weight="600" fill="#262626">VoiceOverlay.exe</text>
<text x="410" y="264" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="11" fill="#8C8C8C">语音悬浮球，Ctrl+Win 长按说话（按需拉起）</text>
<!-- 底部数据流 -->
<rect x="32" y="292" width="656" height="52" rx="8" fill="#F5F5F5"/>
<rect x="48" y="302" width="128" height="32" rx="16" fill="#FFFFFF" stroke="#E8E8E8"/>
<text x="112" y="323" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#262626">敲拼音 / 按住说话</text>
<line x1="190" y1="318" x2="226" y2="318" stroke="#8C8C8C" stroke-width="1.5" marker-end="url(#vm-arrow)"/>
<text x="360" y="323" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#8C8C8C">lua 过滤器链 · Qwen3-ASR 本地推理</text>
<line x1="494" y1="318" x2="530" y2="318" stroke="#8C8C8C" stroke-width="1.5" marker-end="url(#vm-arrow)"/>
<rect x="540" y="302" width="132" height="32" rx="16" fill="#F6FFED" stroke="#B7EB8F"/>
<text x="606" y="323" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, system-ui, sans-serif" font-size="12" font-weight="600" fill="#389E0D">上屏</text>
<text x="360" y="364" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#8C8C8C">小狼毫 Weasel 0.17+ · librime 1.13 · rime-ice 词库 · llama.cpp CPU 推理</text>
</svg>
</div>
<p style="text-align:center;color:#8C8C8C;font-size:12px;margin:8px 0 24px;">图 1 · 左边是按 `v` 之后候选栏里发生的事，右边是它背后常驻的三个小进程</p>

## 一个 v，五个入口

装好之后**打字的部分完全没变**，只是多了一个 `v`：

| 按键 | 作用 |
| --- | --- |
| `v` | 打开功能菜单，候选一行 5 项：设置 / 剪贴板 / 快捷输入 / 常用语 / 原符号 |
| `v` → `1` | 打开可视化设置窗口（词库、剪贴板、模糊音、语音快捷键都在里面） |
| `v` → `2` | 剪贴板快查：数字键上屏那一条，`m` 多看 10 条，`d` 删除，`x` 清空 |
| `v` → `3` | 快捷输入：计算 / 日期 / 时间 / 农历 / 数字大写 / Unicode / 部件拆字 |
| `v` → `4` | 常用语快查（继续输编码可过滤） |
| `v` → `5` | 原符号输入，还原原版 `v` 模式（`v` `2` → 二 贰 ² ₂ Ⅱ） |
| `v` + 回车 | 直接打出字母 `v`（中文模式下想输 v 不用切英文） |

几个细节是踩过坑才加上的：菜单开着时 `Ctrl+C` / `Ctrl+V` / `Ctrl+A` **原样交给程序**（以前会误开菜单）；敲太快的连击会被**防误触**吞掉，默认 30ms 阈值，设置窗口里可调；打网址或 Windows 路径时 `。` 自动变 `.`、`、` 自动变 `\`，不用切英文。

## 打字体验的三件小事

**候选框**：默认一行 9 个候选，按 `↓` 展开成 **4 行 × 9 列**的方格，再按 `↑` 收起；长英文候选自动截断，不会把候选栏挤爆。

**下一个候选词预测**：基于 12.5MB 的字级二元统计（`predict-bigram.txt`），上一个词直接把下一个词推到候选里 —— 写句子时少敲几次。

**前后鼻音模糊**：`an/ang`、`en/eng`、`in/ing`、`ian/iang`、`uan/uang` 五对**逐对开关**，在设置窗口里勾选，不用改 yaml。北方方言区打字再也不用纠结有没有那个 `g`。

**词库**：rime-ice 基线（含大词库与 emoji 修正）+ 你自己的个人词库和常用语。常用语在正常打字时输编码前 3 位就会出现在候选里，也能 `v` → `4` 主动查。

## 语音输入：本地推理，文件不出本机

这是整套里最「重」的功能，也是我最常用的一个：

- **按住 `Ctrl+Win` 说话，松开即上屏**（快捷键在设置窗口「语音输入」页可改）；
- 流式输出：说话过程中就能看到文字逐步出来，不用等说完；
- 模型是 **Qwen3-ASR 0.6B**，量化后两个文件共 **971MB**（`Q8_0` 主模型 767MB + `mmproj` 205MB），随 exe 和 zip 一起发；
- 推理走随包附带的 **llama.cpp CPU 运行时**，首字约 **1~3 秒**，全程离线 —— 不联网、不注册、不计调用次数；
- 有 NVIDIA 显卡的话，把 llama.cpp 官方 CUDA 构建的 `llama-server.exe` 覆盖进安装目录的 `llama.cpp\` 就能提速；
- 语音用完它自己会把 `llama-server.exe` 停掉（这一步是为安装器准备的：不把它停掉，覆盖安装时模型文件会被占用）。

另外还带一个 `语音输入.bat` 命令行版：说完回车，2 秒内自动粘贴，不带悬浮球。

## 设置窗口与后台常驻

我不想每改一个配置都去手编辑 yaml，所以做了一个**原生设置窗口**（`VMenuSettings.exe`，C# WinForms，无依赖）：

- 词库管理（加词 / 删词 / 常用语编辑）、剪贴板历史列表、模糊音开关、语音快捷键、防误触阈值、候选词预测开关，改完**立刻生效，不用重启**；
- 进程是**常驻**的，所以 `v` → `1` 是秒开；右键托盘 →「输入法设置 (S)」打开实测 **0.2~0.3 秒**；
- 内存占用：设置窗口约 17MB，守护与剪贴板同步各约 1MB。不想常驻可以 `VMenu.exe stop`；
- 自带 **`--hotkeytest`** 自检命令，装完可以验证热键注册是否正常。

## 安装：两种包，功能完全一致

<div style="border:1px solid #E8E8E8;border-radius:12px;padding:24px;margin:24px 0;background:#FFFFFF;">
<div style="font-size:16px;font-weight:700;color:#262626;margin-bottom:4px;">Rime VMenu 全家桶 1.0.0 · 下载</div>
<div style="font-size:13px;color:#8C8C8C;margin-bottom:16px;">Windows 10/11 x64 · 不需要管理员权限 · 内含 971MB 语音模型</div>
<div style="margin-bottom:16px;">
<a href="https://github.com/SeanWang114514/weasel-vmenu-suite/releases/download/v1.0.0/RimeVMenu-Setup-1.0.0.exe" style="display:inline-block;background:#1677FF;color:#FFFFFF;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin-right:12px;margin-bottom:8px;">⬇ 下载 exe 直装包（1,195,182,480 字节）</a>
<a href="https://github.com/SeanWang114514/weasel-vmenu-suite/releases/download/v1.0.0/RimeVMenu-1.0.0.zip" style="display:inline-block;background:#FFFFFF;color:#595959;padding:9px 24px;border-radius:6px;text-decoration:none;font-size:14px;border:1px solid #D9D9D9;margin-right:12px;margin-bottom:8px;">⬇ 下载 rime 导入 zip（1,199,917,490 字节）</a>
<a href="https://github.com/SeanWang114514/weasel-vmenu-suite" style="display:inline-block;background:#FFFFFF;color:#595959;padding:9px 24px;border-radius:6px;text-decoration:none;font-size:14px;border:1px solid #D9D9D9;margin-bottom:8px;">查看项目源码</a>
</div>
<div style="font-size:12px;color:#8C8C8C;">项目地址：<a href="https://github.com/SeanWang114514/weasel-vmenu-suite" style="color:#1677FF;">github.com/SeanWang114514/weasel-vmenu-suite</a>　·　下载地址：<a href="https://github.com/SeanWang114514/weasel-vmenu-suite/releases" style="color:#1677FF;">/releases</a></div>
</div>

**方式 A：exe 直装（推荐）** —— 双击 `RimeVMenu-Setup-1.0.0.exe`，安装目录**默认就是你的 Rime 用户目录**（注册表 `RimeUserDir`，通常是 `%APPDATA%\Rime`），装完自动收尾：注册开机自启、装托盘入口、启动后台服务、**重新部署输入法**。没装小狼毫也没关系，安装器会引导你先跑随包附带的 Weasel 0.17.4 安装器。

**方式 B：zip + 一键安装** —— 解压到任意位置，双击解压目录里的 `安装.bat`，它会把整包复制进 Rime 用户目录并执行与 exe 相同的收尾步骤。

**方式 C：官方 `rime-install` 导入（只更新配置）** —— 小狼毫自带的包安装器能直接吃这个 zip：

```bat
"C:\Program Files\Rime\weasel-0.17.x\rime-install.bat" C:\RimePkg\RimeVMenu-1.0.0.zip
```

两个实测出来的边界要知道：**zip 路径里不能有空格、也不能加引号**（否则 `rime-install.bat` 自己会报 batch 语法错，或把参数误判成包名去 GitHub 下载）；而且官方规则**只复制顶层 `*.yaml`、`*.txt` 和 `opencc\`**，不带 `lua\`、`cn_dicts\` 和外挂 exe —— 所以它适合给已部署好的机器覆盖更新配置，**全新安装请用方式 A 或 B**。

**校验**（`Get-FileHash 文件 -Algorithm SHA256`）：

```
RimeVMenu-Setup-1.0.0.exe   469B39DC81394DD26DAF96EBE377FBA52DD2B8D8991AC40EA1BF92C5EBE5B586
RimeVMenu-1.0.0.zip         7FC46D27EFD936FD0BBBD2AEF155AC7570D15DBDDD25203606CC254170A87B6E
```

**卸载**：控制面板 → 卸载「RimeVMenu 全家桶」，会停掉后台服务、还原托盘菜单改动、删除安装的文件 —— **你自己的词库、常用语和剪贴板历史会保留**（这一点是实测过的，不是写写而已）。

装完之后随便找个输入框打 `v`，菜单出来就是成功了。

## 从源码构建

```bat
git clone https://github.com/SeanWang114514/weasel-vmenu-suite.git
cd weasel-vmenu-suite
下载Qwen模型.bat                                :: 拉两个模型（>100MB，不进 git）
powershell -ExecutionPolicy Bypass -File packaging\build-release.ps1
```

产物落在 `out\`，就是上面那两个包。构建脚本支持 `-NoModels`（跳过 971MB 模型，冒烟测试用）、`-SkipZip`、`-SkipExe`；打 exe 直装包需要 [Inno Setup 6](https://jrsoftware.org/isinfo.php)。仓库里有 `.gitattributes` 把 `.bat` / `.ps1` 锁成 CRLF，clone 下来不用手动改换行符。

## 已知限制

不想给用户挖坑，几条实打实的：

- **方向键不能移动选中项**（只有 `↓` / `↑` 展开收起），选词用数字键或空格 —— 小狼毫的 Lua 接口没有这个能力；
- 语音走 CPU 推理，**首字 1~3 秒**是正常速度，想快就换 CUDA 版 `llama-server.exe`；
- 剪贴板多行内容会被压平成一行（缓存格式一行一条）；
- 小狼毫**升级 / 修复安装**会把托盘右键菜单那一项退回原样，重跑一次安装脚本即可恢复；
- 常用语的「打字命中」只在中文模式生效，编码至少要 3 位。

完整清单在仓库的 `使用说明.md` 里。

## 开源与致谢

本项目站在这些项目肩膀上：

- [Weasel（小狼毫）](https://github.com/rime/weasel) 与 [librime](https://github.com/rime/librime) — 输入法宿主与核心引擎
- [rime-ice](https://github.com/iDvel/rime-ice) — 词库与方案基线
- [llama.cpp](https://github.com/ggml-org/llama.cpp) — CPU 推理运行时
- [Qwen3-ASR](https://huggingface.co/ggml-org/Qwen3-ASR-0.6B-GGUF) — 语音识别模型
- [OpenCC](https://github.com/BYVoid/OpenCC) — 简繁转换

这些组件**保留各自原有许可**，详见仓库 `README.md`。

## 写在最后

这个套件没有「改变输入方式」的野心，它只是把我用了几年小狼毫攒下的那些顺手的小改进，打包成**双击就能装好**的一份东西：一个 `v` 出菜单，一个窗口管配置，一个快捷键把想说的话变成字，而且全程不联网。

两种包任选，功能完全一致：

- **项目地址**：[github.com/SeanWang114514/weasel-vmenu-suite](https://github.com/SeanWang114514/weasel-vmenu-suite)
- **下载地址**：[github.com/SeanWang114514/weasel-vmenu-suite/releases/tag/v1.0.0](https://github.com/SeanWang114514/weasel-vmenu-suite/releases/tag/v1.0.0)

欢迎下载体验，也欢迎到仓库提 issue 或点个 star。
