(function () {
  "use strict";
  var app = document.querySelector("[data-admin]");
  var api = window.BlogCommunity;
  if (!app || !api) return;
  var auth = api.auth, node = api.node;
  var gate = app.querySelector("[data-admin-gate]");
  var workspace = app.querySelector("[data-admin-workspace]");
  var status = app.querySelector("[data-admin-status]");
  var editor = app.querySelector("[data-admin-editor]");
  var body = editor.elements.body, richBody = app.querySelector("[data-admin-rich-body]"), path = editor.elements.path, publishState = editor.elements.published;
  var fields = { title: editor.elements.title, subtitle: editor.elements.subtitle, date: editor.elements.date, categories: editor.elements.categories, tags: editor.elements.tags, headerImage: editor.elements.headerImage };
  var posts = [], taxonomy = { tags: [], categories: [] }, current = null, sourceBase = "", dirty = false, settingsDirty = false, loadedFor = "", busy = false, mediaLoaded = false, commentsOffset = 0, sourceMode = false;
  var settings = { wallpapers: [], playlist: [] }, libraries = { images: [], audio: [] };
  var commentMore = app.querySelector("[data-admin-comment-more]");
  var tabs = Array.from(app.querySelectorAll("[data-admin-tab]"));

  function button(label, icon, action) {
    var el = node("button", undefined, "community__button");
    el.type = "button";
    el.title = label;
    if (icon) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      var use = document.createElementNS(svg.namespaceURI, "use");
      svg.setAttribute("viewBox", "0 0 24 24");
      use.setAttribute("href", "#i-" + icon);
      svg.setAttribute("aria-hidden", "true");
      svg.appendChild(use);
      el.appendChild(svg);
      el.appendChild(node("span", label, "sr-only"));
    } else el.textContent = label;
    el.addEventListener("click", action);
    return el;
  }
  async function operation(work) {
    if (busy) return;
    busy = true;
    app.setAttribute("aria-busy", "true");
    status.textContent = "正在处理…";
    status.classList.remove("is-error");
    var controls = Array.from(app.querySelectorAll("button, input, textarea, select, [contenteditable='true']")).map(function (el) {
      var state = { element: el, disabled: el.disabled, contentEditable: el.getAttribute("contenteditable") };
      if ("disabled" in el) el.disabled = true;
      if (state.contentEditable !== null) el.setAttribute("contenteditable", "false");
      return state;
    });
    try { await work(); }
    catch (error) {
      var message = error.message || "操作失败，请稍后重试。";
      if (/未知操作|unknown action/i.test(message)) message = "线上内容服务仍是旧版本，缺少文章读取接口（read）。请在项目目录执行 supabase functions deploy blog-admin --project-ref sjhcqdicvahlqlpnupas --use-api，完成后再刷新本页；在此之前无法读取已发布文章的正文。";
      status.textContent = message;
      status.classList.add("is-error");
    }
    finally {
      busy = false;
      app.removeAttribute("aria-busy");
      controls.forEach(function (state) {
        if (!state.element.isConnected) return;
        if ("disabled" in state.element) state.element.disabled = state.disabled;
        if (state.contentEditable !== null) state.element.setAttribute("contenteditable", state.contentEditable);
      });
      app.querySelector("[data-admin-delete]").disabled = !current;
    }
  }
  function fieldText(value) {
    if (Array.isArray(value)) return value.join(", ");
    return value === undefined || value === null ? "" : String(value);
  }
  function fillFields(data) {
    data = data || {};
    fields.title.value = data.title || "新文章";
    fields.subtitle.value = fieldText(data.subtitle);
    fields.date.value = (data.date || (localDate() + " 08:00")).replace(" ", "T").slice(0, 16);
    fields.categories.value = fieldText(data.categories);
    fields.tags.value = fieldText(data.tags);
    fields.headerImage.value = fieldText(data.headerImage);
  }
  function discardEditorChanges() {
    fillFields(current ? current.fields : {});
    publishState.value = String(!!(current && current.published));
    body.value = (current && typeof current.body === "string") ? current.body : "";
    richBody.innerHTML = markdownToRichHtml(body.value);
    dirty = false;
    updateSaveState();
  }
  function canDiscard() {
    if (dirty) {
      if (!confirm("当前文稿尚未提交，确定放弃这些修改？")) return false;
      discardEditorChanges();
    }
    if (settingsDirty && !confirm("背景或音乐设置尚未保存，确定放弃这些修改？")) return false;
    return true;
  }
  function localDate() {
    var now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]; });
  }
  function renderInline(value) {
    var imagePattern = /!\[([^\]]*)\]\(((?:https:\/\/[^\s)]+|\/(?!\/)[^\s)]*))(?:\s+"([^"]*)")?\)/g;
    var output = "", cursor = 0, match;
    while ((match = imagePattern.exec(value))) {
      output += escapeHTML(value.slice(cursor, match.index));
      output += '<img src="' + escapeHTML(match[2]) + '" alt="' + escapeHTML(match[1]) + '"' + (match[3] ? ' title="' + escapeHTML(match[3]) + '"' : '') + ' loading="lazy" decoding="async">';
      cursor = match.index + match[0].length;
    }
    var text = output + escapeHTML(value.slice(cursor)), codeSpans = [];
    text = text.replace(/`([^`]+)`/g, function (_, code) { codeSpans.push(code); return "\uE000" + (codeSpans.length - 1) + "\uE001"; });
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/~~([\s\S]+?)~~/g, "<del>$1</del>");
    text = text.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
    return text.replace(/\uE000(\d+)\uE001/g, function (_, index) { return "<code>" + codeSpans[Number(index)] + "</code>"; });
  }
  function renderMarkdown(value) {
    var lines = value.replace(/\r\n?/g, "\n").split("\n"), output = [], paragraph = [], listStack = [], code = false, codeLanguage = "", codeLines = [];
    function flushParagraph() { if (paragraph.length) output.push("<p>" + paragraph.map(renderInline).join("<br>") + "</p>"); paragraph = []; }
    function flushList() { while (listStack.length) { var level = listStack.pop(); output.push("</li></" + level.tag + ">"); } }
    function cells(line) { return line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map(function (cell) { return cell.replace(/\\\|/g, "|").trim(); }); }
    function tableSeparator(line) { var columns = cells(line); return columns.length > 0 && columns.every(function (cell) { return /^:?-{3,}:?$/.test(cell); }); }
    function renderTable(header, separator, rows) {
      var alignments = separator.map(function (cell) { return cell.charAt(0) === ":" ? (cell.charAt(cell.length - 1) === ":" ? "center" : "left") : (cell.charAt(cell.length - 1) === ":" ? "right" : "left"); });
      function row(values, tag) { return "<tr>" + values.map(function (cell, index) { return "<" + tag + ' style="text-align:' + (alignments[index] || "left") + '">' + renderInline(cell) + "</" + tag + ">"; }).join("") + "</tr>"; }
      return "<div class=\"admin__table-wrap\"><table><thead>" + row(header, "th") + "</thead><tbody>" + rows.map(function (values) { return row(values, "td"); }).join("") + "</tbody></table></div>";
    }
    for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      var line = lines[lineIndex];
      var fence = /^\s*```\s*([\w+-]*)\s*$/.exec(line);
      if (fence) {
        flushParagraph(); flushList();
        if (code) { output.push('<pre><code' + (codeLanguage ? ' class="language-' + escapeHTML(codeLanguage) + '"' : "") + ">" + escapeHTML(codeLines.join("\n")) + "</code></pre>"); codeLines = []; codeLanguage = ""; code = false; }
        else { code = true; codeLanguage = fence[1]; }
        continue;
      }
      if (code) { codeLines.push(line); continue; }
      var heading = /^(#{1,6})\s+(.+)$/.exec(line);
      var bullet = /^\s*[-*+]\s+(.+)$/.exec(line);
      var number = /^\s*\d+[.)]\s+(.+)$/.exec(line);
      var table = line.indexOf("|") >= 0 && lines[lineIndex + 1] && tableSeparator(lines[lineIndex + 1]);
      if (!line.trim() || heading || bullet || number || /^\s*>/.test(line) || table || /^\s*([-*_]\s*){3,}$/.test(line)) flushParagraph();
      if (table) {
        flushList();
        var header = cells(line), separator = cells(lines[++lineIndex]), rows = [];
        while (lineIndex + 1 < lines.length && lines[lineIndex + 1].indexOf("|") >= 0 && lines[lineIndex + 1].trim()) rows.push(cells(lines[++lineIndex]));
        output.push(renderTable(header, separator, rows));
      }
      else if (heading) { flushList(); var level = heading[1].length; output.push("<h" + level + ">" + renderInline(heading[2]) + "</h" + level + ">"); }
      else if (bullet || number) {
        var kind = bullet ? "ul" : "ol", itemText = (bullet || number)[1];
        var indent = /^\s*/.exec(line)[0].replace(/\t/g, "  ").length;
        while (listStack.length && listStack[listStack.length - 1].indent > indent) { var deeper = listStack.pop(); output.push("</li></" + deeper.tag + ">"); }
        var top = listStack[listStack.length - 1];
        if (!top || indent > top.indent) { output.push("<" + kind + "><li>" + renderInline(itemText)); listStack.push({ tag: kind, indent: indent }); }
        else if (top.tag !== kind) { output.push("</li></" + top.tag + ">"); listStack.pop(); output.push("<" + kind + "><li>" + renderInline(itemText)); listStack.push({ tag: kind, indent: indent }); }
        else output.push("</li><li>" + renderInline(itemText));
      } else if (/^\s*>/.test(line)) {
        flushList();
        var quoteLines = [line.replace(/^\s*>\s?/, "")];
        while (lineIndex + 1 < lines.length && /^\s*>/.test(lines[lineIndex + 1])) quoteLines.push(lines[++lineIndex].replace(/^\s*>\s?/, ""));
        var quoteBlocks = [], quoteParagraph = [];
        quoteLines.forEach(function (quoteLine) {
          if (quoteLine.trim()) quoteParagraph.push(quoteLine);
          else if (quoteParagraph.length) { quoteBlocks.push(quoteParagraph); quoteParagraph = []; }
        });
        if (quoteParagraph.length) quoteBlocks.push(quoteParagraph);
        output.push("<blockquote>" + quoteBlocks.map(function (block) { return "<p>" + block.map(renderInline).join("<br>") + "</p>"; }).join("") + "</blockquote>");
      }
      else if (/^\s*([-*_]\s*){3,}$/.test(line)) { flushList(); output.push("<hr>"); }
      else if (line.trim()) { flushList(); paragraph.push(line); }
      else flushList();
    }
    flushParagraph(); flushList();
    if (code) output.push('<pre><code' + (codeLanguage ? ' class="language-' + escapeHTML(codeLanguage) + '"' : "") + ">" + escapeHTML(codeLines.join("\n")) + "</code></pre>");
    return output.join("");
  }
  var htmlBlockTags = new Set(["div", "section", "figure", "table", "details", "svg", "p", "ul", "ol", "blockquote", "hr"]);
  function safeUrl(value) {
    return /^https?:\/\/[^\s<>"']+$/i.test(value) || /^#[-\w]+$/.test(value) || /^\/(?!\/)[^\s<>"']*$/.test(value) ? value : "";
  }
  function cleanPastedNode(sourceNode, target) {
    if (sourceNode.nodeType === 3) { target.appendChild(document.createTextNode(sourceNode.nodeValue || "")); return; }
    if (sourceNode.nodeType !== 1) return;
    var tag = sourceNode.localName.toLowerCase(), allowed = new Set(["a", "b", "blockquote", "br", "code", "del", "em", "h1", "h2", "h3", "h4", "hr", "i", "img", "li", "ol", "p", "pre", "s", "span", "strong", "table", "tbody", "td", "th", "thead", "tr", "ul"]);
    if (!allowed.has(tag)) { Array.from(sourceNode.childNodes).forEach(function (child) { cleanPastedNode(child, target); }); return; }
    var clean = document.createElement(tag);
    Array.from(sourceNode.attributes).forEach(function (attribute) {
      var name = attribute.name.toLowerCase(), value = attribute.value;
      if (name === "href" || name === "src") { var url = safeUrl(value); if (url) clean.setAttribute(name, url); }
      else if (["alt", "title", "colspan"].includes(name) && value.length <= 300) clean.setAttribute(name, value);
    });
    Array.from(sourceNode.childNodes).forEach(function (child) { cleanPastedNode(child, clean); });
    target.appendChild(clean);
  }
  function safePastedHtml(source) {
    var parsed = new DOMParser().parseFromString(source, "text/html"), container = document.createElement("div");
    Array.from(parsed.body.childNodes).forEach(function (child) { cleanPastedNode(child, container); });
    return container.innerHTML;
  }
  function markdownToRichHtml(source) {
    var lines = source.replace(/\r\n?/g, "\n").split("\n"), blocks = [], prepared = [], index = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.trim() === "<!--more-->") {
        var marker = "SW_ADMIN_MARKER_" + index++ + "_END";
        blocks.push({ marker: marker, html: '<div class="admin__more-marker" data-admin-marker="more" contenteditable="false">文章摘要分隔线</div>' });
        prepared.push("", marker, "");
        continue;
      }
      var start = /^\s*<(div|section|figure|table|details|svg|p|ul|ol|blockquote|hr)\b/i.exec(line);
      if (start && htmlBlockTags.has(start[1].toLowerCase())) {
        var tag = start[1].toLowerCase(), raw = [line], open = (line.match(new RegExp("<" + tag + "\\b", "gi")) || []).length, close = (line.match(new RegExp("</" + tag + "\\s*>", "gi")) || []).length;
        while (tag !== "hr" && open > close && i + 1 < lines.length) {
          line = lines[++i]; raw.push(line);
          open += (line.match(new RegExp("<" + tag + "\\b", "gi")) || []).length;
          close += (line.match(new RegExp("</" + tag + "\\s*>", "gi")) || []).length;
        }
        var token = "SW_ADMIN_HTML_" + index++ + "_END";
        blocks.push({ marker: token, html: '<details class="admin__html-block" data-admin-html-block="true"><summary>自定义 HTML / SVG 内容块（展开可编辑源码）</summary><textarea data-admin-html-source spellcheck="false">' + escapeHTML(raw.join("\n")) + "</textarea></details>" });
        prepared.push("", token, "");
      } else prepared.push(line);
    }
    var template = document.createElement("template");
    template.innerHTML = renderMarkdown(prepared.join("\n"));
    blocks.forEach(function (block) {
      Array.from(template.content.querySelectorAll("p")).some(function (paragraph) {
        if (paragraph.textContent.trim() !== block.marker) return false;
        var holder = document.createElement("template");
        holder.innerHTML = block.html;
        paragraph.replaceWith(holder.content.cloneNode(true));
        return true;
      });
    });
    return template.innerHTML;
  }
  function escapeMarkdown(value) { return value.replace(/\\/g, "\\\\").replace(/([`*{}\[\]!])/g, "\\$1"); }
  function serializeInline(element) {
    if (element.nodeType === 3) return escapeMarkdown(element.nodeValue || "");
    if (element.nodeType !== 1) return "";
    var tag = element.localName.toLowerCase(), content = Array.from(element.childNodes).map(serializeInline).join("");
    if (tag === "br") return "  \n";
    if (tag === "strong" || tag === "b") return "**" + content + "**";
    if (tag === "em" || tag === "i") return "*" + content + "*";
    if (tag === "del" || tag === "s") return "~~" + content + "~~";
    if (tag === "code") return "`" + (element.textContent || "").replace(/`/g, "\\`") + "`";
    if (tag === "a") { var href = safeUrl(element.getAttribute("href") || ""); return href ? "[" + content + "](" + href + ")" : content; }
    if (tag === "img") { var src = safeUrl(element.getAttribute("src") || ""); return src ? "![" + escapeMarkdown(element.getAttribute("alt") || "") + "](" + src + ")" : ""; }
    return content;
  }
  function serializeList(list, depth) {
    return Array.from(list.children).filter(function (item) { return item.localName.toLowerCase() === "li"; }).map(function (item, index) {
      var nested = Array.from(item.children).filter(function (child) { return ["ul", "ol"].includes(child.localName.toLowerCase()); });
      var content = Array.from(item.childNodes).filter(function (child) { return child.nodeType !== 1 || !["ul", "ol"].includes(child.localName.toLowerCase()); }).map(serializeInline).join("").trim();
      return "  ".repeat(depth) + (list.localName.toLowerCase() === "ol" ? (index + 1) + ". " : "- ") + content + "\n" + nested.map(function (child) { return serializeList(child, depth + 1); }).join("");
    }).join("");
  }
  function serializeTable(table) {
    var rows = Array.from(table.querySelectorAll("tr")).map(function (row) { return Array.from(row.children).map(function (cell) { return serializeInline(cell).trim().replace(/\|/g, "\\|"); }); });
    return rows.length ? "| " + rows[0].join(" | ") + " |\n| " + rows[0].map(function () { return "---"; }).join(" | ") + " |\n" + rows.slice(1).map(function (row) { return "| " + row.join(" | ") + " |"; }).join("\n") + "\n\n" : "";
  }
  function serializeBlock(element) {
    var tag = element.localName.toLowerCase();
    if (element.hasAttribute("data-admin-marker")) return "<!--more-->\n\n";
    if (element.hasAttribute("data-admin-html-block")) return ((element.querySelector("[data-admin-html-source]") || {}).value || "") + "\n\n";
    if (/^h[1-6]$/.test(tag)) return "#".repeat(Number(tag[1])) + " " + Array.from(element.childNodes).map(serializeInline).join("").trim() + "\n\n";
    if (tag === "p" || (tag === "div" && !element.querySelector(":scope > p, :scope > div, :scope > ul, :scope > ol, :scope > table, :scope > pre, :scope > blockquote"))) return Array.from(element.childNodes).map(serializeInline).join("").trim() + "\n\n";
    if (tag === "ul" || tag === "ol") return serializeList(element, 0) + "\n";
    if (tag === "blockquote") {
      var quoteParts = [];
      Array.from(element.childNodes).forEach(function (child) {
        if (child.nodeType === 3) { var text = (child.nodeValue || "").trim(); if (text) quoteParts.push(escapeMarkdown(text)); return; }
        if (child.nodeType !== 1) return;
        var childTag = child.localName.toLowerCase();
        if (childTag === "p" || childTag === "div" || /^h[1-6]$/.test(childTag)) quoteParts.push(Array.from(child.childNodes).map(serializeInline).join("").trim());
        else quoteParts.push(serializeBlock(child).trim());
      });
      return quoteParts.filter(function (part) { return part; }).join("\n\n").split("\n").map(function (line) { return line ? "> " + line : ">"; }).join("\n") + "\n\n";
    }
    if (tag === "pre") { var code = element.querySelector("code"), language = code && Array.from(code.classList).map(function (name) { return /^language-[\w+-]+$/.test(name) ? name.slice(9) : ""; }).filter(Boolean)[0] || ""; return "```" + language + "\n" + (code || element).textContent.replace(/\n+$/, "") + "\n```\n\n"; }
    if (tag === "table") return serializeTable(element);
    if (tag === "hr") return "---\n\n";
    if (tag === "img") return serializeInline(element) + "\n\n";
    return Array.from(element.childNodes).map(serializeBlock).join("");
  }
  function richHtmlToMarkdown() {
    return Array.from(richBody.childNodes).map(function (child) {
      if (child.nodeType === 3) return child.nodeValue.trim() ? escapeMarkdown(child.nodeValue.trim()) + "\n\n" : "";
      return child.nodeType === 1 ? serializeBlock(child) : "";
    }).join("").replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "") + "\n";
  }
  function editorData() {
    return {
      title: fields.title.value,
      subtitle: fields.subtitle.value,
      date: fields.date.value,
      categories: fields.categories.value,
      tags: fields.tags.value,
      headerImage: fields.headerImage.value,
      published: publishState.value === "true"
    };
  }
  function edit(post, imported) {
    current = post || null;
    app.querySelector("[data-admin-post-list]").hidden = true;
    editor.hidden = false;
    path.value = post ? post.path.slice("_posts/".length) : localDate() + "-new-post.markdown";
    path.readOnly = !!post;
    var data = (post && post.fields) || (imported && imported.fields) || (post ? { title: post.title, date: post.date, categories: (post.categories || []).join(", "), tags: (post.tags || []).join(", "), published: post.published } : {});
    sourceBase = (post && post.source) || (imported && imported.source) || "---\nlayout: post\ntitle: 新文章\ndate: " + localDate() + " 08:00:00\nauthor: Sean Wang\ncategory: \"\"\ntags: []\n---\n\n";
    fillFields(data);
    publishState.value = String(post ? post.published : false);
    body.value = (post && post.body) || (imported && imported.body) || "";
    sourceMode = false;
    body.hidden = true;
    richBody.hidden = false;
    richBody.innerHTML = markdownToRichHtml(body.value);
    editor.classList.add("is-visible");
    app.querySelector("[data-admin-toggle-source]").setAttribute("aria-pressed", "false");
    app.querySelector("[data-admin-editor-mode]").textContent = "所见即所得";
    app.querySelector("[data-editor-heading]").textContent = post ? "编辑文章" : "新建文章";
    dirty = false;
    updateSaveState();
    app.querySelector("[data-admin-delete]").disabled = !post;
    app.querySelectorAll("[data-post-path]").forEach(function (el) { el.setAttribute("aria-pressed", String(!!post && el.getAttribute("data-post-path") === post.path)); });
    requestAnimationFrame(function () { editor.scrollIntoView({ behavior: "smooth", block: "start" }); });
  }
  function showPosts() {
    var list = app.querySelector("[data-admin-post-list]");
    list.replaceChildren();
    if (!posts.length) list.appendChild(node("p", "暂无文章。"));
    posts.forEach(function (post) {
      var item = node("button", undefined, "admin__post-row");
      item.type = "button";
      item.setAttribute("data-post-path", post.path);
      item.setAttribute("aria-pressed", String(!!current && current.path === post.path));
      item.appendChild(node("strong", post.title));
      item.appendChild(node("small", post.date.slice(0, 10) + (post.published ? " · 已发布" : " · 草稿")));
      item.addEventListener("click", function () {
        if (!canDiscard()) return;
        operation(async function () {
          var result = await api.adminRequest({ action: "read", path: post.path });
          var loaded = result.post || result;
          if (!loaded.source || !loaded.fields || typeof loaded.body !== "string") throw new Error("文章正文尚未返回。请重新部署后台内容服务后重试。");
          var index = posts.findIndex(function (item) { return item.path === post.path; });
          if (index >= 0) posts[index] = loaded;
          showPosts();
          edit(loaded);
          status.textContent = "已载入《" + loaded.fields.title + "》，正文共 " + loaded.body.length + " 个字符。";
        });
      });
      list.appendChild(item);
    });
  }
  function returnToList() {
    var hadChanges = dirty;
    if (!canDiscard()) return;
    current = null;
    dirty = false;
    sourceBase = "";
    body.value = "";
    richBody.replaceChildren();
    updateSaveState();
    editor.hidden = true;
    app.querySelector("[data-admin-post-list]").hidden = false;
    showPosts();
    status.textContent = hadChanges ? "已返回文章列表，未保存的修改已放弃。" : "已返回文章列表。";
  }
  function updateSaveState() {
    var published = publishState.value === "true";
    var dirtyState = app.querySelector("[data-admin-dirty-state]");
    app.querySelector("[data-admin-save-label]").textContent = published
      ? (current && current.published ? "保存并更新" : "保存并发布")
      : "保存草稿";
    app.querySelector("[data-editor-save-hint]").textContent = published
      ? "保存后会提交到仓库并触发网站构建"
      : "草稿会保存在仓库中，不会出现在公开文章列表";
    dirtyState.textContent = dirty ? "有未保存修改" : (current ? "已与仓库同步" : "新建草稿");
    dirtyState.classList.toggle("is-dirty", dirty);
  }
  function assetUrl(url) {
    return url && url.charAt(0) === "/" ? (window.SW.baseurl || "") + url : url;
  }
  function shift(items, index, amount) {
    var target = index + amount;
    if (target < 0 || target >= items.length) return;
    var item = items.splice(index, 1)[0];
    items.splice(target, 0, item);
    settingsDirty = true;
    showSettings();
  }
  function showSettings() {
    var wallpapers = app.querySelector("[data-admin-wallpapers]");
    var playlist = app.querySelector("[data-admin-playlist]");
    wallpapers.replaceChildren();
    playlist.replaceChildren();
    if (!settings.wallpapers.length) wallpapers.appendChild(node("p", "请至少添加一张背景图片。"));
    settings.wallpapers.forEach(function (item, index) {
      var card = node("article", undefined, "admin__asset-card");
      var image = node("img");
      image.src = assetUrl(item.thumbnail || item.src);
      image.alt = item.name || "背景预览";
      image.loading = "lazy";
      card.appendChild(image);
      var name = node("label", "背景名称");
      var nameInput = node("input");
      nameInput.value = item.name || "";
      nameInput.maxLength = 80;
      nameInput.addEventListener("input", function () { item.name = nameInput.value; settingsDirty = true; });
      name.appendChild(nameInput);
      card.appendChild(name);
      var src = node("label", "图片地址");
      var srcInput = node("input");
      srcInput.value = item.src || "";
      srcInput.maxLength = 2048;
      srcInput.addEventListener("input", function () { item.src = srcInput.value; image.src = assetUrl(srcInput.value); settingsDirty = true; });
      src.appendChild(srcInput);
      card.appendChild(src);
      var position = node("label", "图片位置");
      var positionInput = node("input");
      positionInput.value = item.position || "50% 50%";
      positionInput.placeholder = "50% 50%";
      positionInput.maxLength = 32;
      positionInput.addEventListener("input", function () { item.position = positionInput.value; settingsDirty = true; });
      position.appendChild(positionInput);
      card.appendChild(position);
      var actions = node("div", undefined, "admin__toolbar");
      actions.appendChild(button("上移", "arrow-up", function () { shift(settings.wallpapers, index, -1); }));
      actions.appendChild(button("下移", "arrow-down", function () { shift(settings.wallpapers, index, 1); }));
      actions.appendChild(button("移除背景", "close", function () { settings.wallpapers.splice(index, 1); settingsDirty = true; showSettings(); }));
      card.appendChild(actions);
      wallpapers.appendChild(card);
    });
    if (!settings.playlist.length) playlist.appendChild(node("p", "音乐集为空，可从媒体库添加或上传音乐。"));
    settings.playlist.forEach(function (item, index) {
      var row = node("article", undefined, "admin__track-row");
      var name = node("input");
      name.value = item.name || "";
      name.placeholder = "歌曲名称";
      name.maxLength = 120;
      name.setAttribute("aria-label", "歌曲名称");
      name.addEventListener("input", function () { item.name = name.value; settingsDirty = true; });
      row.appendChild(name);
      var artist = node("input");
      artist.value = item.artist || "";
      artist.placeholder = "演唱者（可选）";
      artist.maxLength = 120;
      artist.setAttribute("aria-label", "演唱者");
      artist.addEventListener("input", function () { item.artist = artist.value; settingsDirty = true; });
      row.appendChild(artist);
      var url = node("input");
      url.value = item.url || "";
      url.placeholder = "音乐地址";
      url.maxLength = 2048;
      url.setAttribute("aria-label", "音乐地址");
      url.addEventListener("input", function () { item.url = url.value; settingsDirty = true; });
      row.appendChild(url);
      var cover = node("input");
      cover.value = item.cover || "";
      cover.placeholder = "封面地址（可选）";
      cover.maxLength = 2048;
      cover.setAttribute("aria-label", "封面地址");
      cover.addEventListener("input", function () { item.cover = cover.value; settingsDirty = true; });
      row.appendChild(cover);
      row.appendChild(button("上移", "arrow-up", function () { shift(settings.playlist, index, -1); }));
      row.appendChild(button("下移", "arrow-down", function () { shift(settings.playlist, index, 1); }));
      row.appendChild(button("移除歌曲", "close", function () { settings.playlist.splice(index, 1); settingsDirty = true; showSettings(); }));
      playlist.appendChild(row);
    });
  }
  function fillLibrary(select, items, label) {
    select.replaceChildren();
    var placeholder = node("option", label);
    placeholder.value = "";
    select.appendChild(placeholder);
    items.forEach(function (item, index) {
      var option = node("option", item.name);
      option.value = String(index);
      select.appendChild(option);
    });
  }
  async function loadMedia() {
    var results = await Promise.all([api.listAssets("image"), api.listAssets("audio")]);
    libraries.images = results[0];
    libraries.audio = results[1];
    fillLibrary(app.querySelector("[data-admin-image-library]"), libraries.images, "选择已上传的图片…");
    fillLibrary(app.querySelector("[data-admin-audio-library]"), libraries.audio, "选择已上传的音乐…");
    status.textContent = "媒体库已读取（" + libraries.images.length + " 张图片，" + libraries.audio.length + " 首音乐）。";
  }
  async function refresh() {
    var result = await api.adminRequest({ action: "list" });
    if (!auth.isAdmin) return;
    posts = result.posts;
    taxonomy = result.taxonomy;
    if (!settingsDirty) settings = result.settings || { wallpapers: [], playlist: [] };
    showPosts();
    app.querySelector("[data-admin-post-list]").hidden = !!current;
    editor.hidden = !current;
    showTaxonomies();
    showSettings();
    status.textContent = "已读取 " + posts.length + " 篇文章。";
  }
  function showTaxonomies() {
    var container = app.querySelector("[data-admin-taxonomies]");
    container.replaceChildren();
    ["categories", "tags"].forEach(function (kind) {
      var section = node("div");
      section.appendChild(node("h3", kind === "tags" ? "标签" : "分类"));
      var add = node("form", undefined, "admin__taxonomy-row");
      var value = node("input");
      value.placeholder = kind === "tags" ? "新标签" : "新分类";
      value.setAttribute("aria-label", value.placeholder);
      value.maxLength = 60;
      value.required = true;
      add.appendChild(value);
      var addButton = node("button", "添加", "community__button");
      addButton.type = "submit";
      add.appendChild(addButton);
      add.addEventListener("submit", function (event) {
        event.preventDefault();
        var name = value.value.trim();
        if (!name) return;
        operation(async function () { var result = await api.adminRequest({ action: "taxonomy", kind: kind, to: name }); await refresh(); status.textContent = result.message; });
      });
      section.appendChild(add);
      (taxonomy[kind] || []).slice().sort().forEach(function (name) {
        var row = node("div", undefined, "admin__taxonomy-row");
        var input = node("input");
        input.value = name;
        input.maxLength = 60;
        input.setAttribute("aria-label", "重命名" + name);
        row.appendChild(input);
        var count = posts.filter(function (post) { return post[kind].includes(name); }).length;
        row.appendChild(node("span", count + " 篇"));
        row.appendChild(button("保存名称", "check", function () {
          var next = input.value.trim();
          if (!next || next === name) return;
          if (!confirm("将“" + name + "”改为“" + next + "”？会同步修改 " + count + " 篇文章。")) return;
          operation(async function () { var result = await api.adminRequest({ action: "taxonomy", kind: kind, from: name, to: next }); await refresh(); status.textContent = result.message; });
        }));
        row.appendChild(button("删除" + name, "close", function () {
          if (!confirm("删除“" + name + "”？会从 " + count + " 篇文章中移除此名称，保留文章。")) return;
          operation(async function () { var result = await api.adminRequest({ action: "taxonomy", kind: kind, from: name, to: "" }); await refresh(); status.textContent = result.message; });
        }));
        section.appendChild(row);
      });
      container.appendChild(section);
    });
  }
  async function loadComments(reset) {
    var list = app.querySelector("[data-admin-comment-list]");
    if (reset) { commentsOffset = 0; list.replaceChildren(); }
    var userId = auth.user && auth.user.id;
    var result = await auth.client.from("blog_comments").select("id,user_id,body,page_path,hidden,created_at,author:blog_profiles(display_name,avatar_url,is_admin)")
      .order("created_at", { ascending: false }).order("id", { ascending: false }).range(commentsOffset, commentsOffset + 29);
    if (!auth.isAdmin || !auth.user || auth.user.id !== userId) return;
    if (result.error) throw new Error("评论读取失败，请稍后重试。");
    result.data.forEach(function (comment) {
      var item = node("article", undefined, "community__comment");
      item.appendChild(api.avatar(comment.author || {}));
      var content = node("div", undefined, "community__content");
      var meta = node("div", undefined, "community__meta");
      meta.appendChild(node("strong", comment.author && comment.author.display_name || "GitHub 用户"));
      if (comment.author && comment.author.is_admin === true) meta.appendChild(node("span", "管理员", "community__badge community__badge--admin"));
      meta.appendChild(node("time", new Date(comment.created_at).toLocaleString("zh-CN")));
      if (comment.hidden) meta.appendChild(node("span", "已隐藏", "community__badge"));
      content.appendChild(meta);
      var link = node("a", comment.page_path);
      if (/^\/(?!\/)/.test(comment.page_path)) link.href = (window.SW.baseurl || "") + comment.page_path + "#comments";
      content.appendChild(link);
      content.appendChild(node("p", comment.body, "community__body"));
      var actions = node("div", undefined, "admin__toolbar");
      actions.appendChild(button(comment.hidden ? "恢复显示" : "隐藏评论", "eye", function () {
        operation(async function () {
          var result = await auth.client.from("blog_comments").update({ hidden: !comment.hidden }).eq("id", comment.id).select("id");
          if (result.error || !result.data.length) throw new Error("权限已失效或评论已移除，请刷新。");
          await loadComments(true);
        });
      }));
      actions.appendChild(button("删除评论", "close", function () {
        if (!confirm("永久删除这条评论？此操作无法恢复。")) return;
        operation(async function () {
          var result = await auth.client.from("blog_comments").delete().eq("id", comment.id).select("id");
          if (result.error || !result.data.length) throw new Error("删除失败，请刷新后重试。");
          await loadComments(true);
        });
      }));
      content.appendChild(actions);
      item.appendChild(content);
      list.appendChild(item);
    });
    commentsOffset += result.data.length;
    commentMore.hidden = result.data.length < 30;
    status.textContent = commentsOffset ? "已读取 " + commentsOffset + " 条评论。" : "暂无评论。";
  }
  function selectTab(tab) {
    if (!canDiscard()) return;
    if (tab.getAttribute("data-admin-tab") === "appearance" && !mediaLoaded) {
      mediaLoaded = true;
      operation(loadMedia).catch(function () { mediaLoaded = false; });
    }
    tabs.forEach(function (button) {
      var selected = button === tab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      app.querySelector('[data-admin-panel="' + button.getAttribute("data-admin-tab") + '"]').hidden = !selected;
    });
    if (tab.getAttribute("data-admin-tab") === "comments") operation(function () { return loadComments(true); });
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (event) {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      var next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });
  function markEditorDirty() {
    if (!sourceMode) body.value = richHtmlToMarkdown();
    dirty = true;
    updateSaveState();
  }
  body.addEventListener("input", function () { if (sourceMode) markEditorDirty(); });
  richBody.addEventListener("input", markEditorDirty);
  Object.keys(fields).forEach(function (key) { fields[key].addEventListener("input", markEditorDirty); });
  publishState.addEventListener("change", markEditorDirty);
  function setSourceMode(enabled) {
    sourceMode = enabled;
    editor.classList.toggle("is-source-mode", enabled);
    body.hidden = !enabled;
    richBody.hidden = enabled;
    app.querySelector("[data-admin-toggle-source]").setAttribute("aria-pressed", String(enabled));
    app.querySelector("[data-admin-editor-mode]").textContent = enabled ? "Markdown 源码" : "所见即所得";
    if (enabled) body.focus(); else { richBody.innerHTML = markdownToRichHtml(body.value); richBody.focus(); }
  }
  app.querySelector("[data-admin-toggle-source]").addEventListener("click", function () { setSourceMode(!sourceMode); });
  app.querySelector("[data-admin-back-to-list]").addEventListener("click", returnToList);
  app.querySelector("[data-admin-post-list]").hidden = false;
  editor.hidden = true;
  richBody.addEventListener("paste", function (event) {
    if (event.target !== richBody) return;
    event.preventDefault();
    var html = event.clipboardData && event.clipboardData.getData("text/html");
    if (html) document.execCommand("insertHTML", false, safePastedHtml(html));
    else document.execCommand("insertText", false, event.clipboardData && event.clipboardData.getData("text/plain") || "");
    markEditorDirty();
  });
  app.querySelectorAll("[data-md-action]").forEach(function (control) {
    control.addEventListener("mousedown", function (event) { event.preventDefault(); });
    control.addEventListener("click", function () {
      if (sourceMode) setSourceMode(false);
      richBody.focus();
      var action = control.getAttribute("data-md-action"), command = { bold: "bold", italic: "italic", list: "insertUnorderedList", "ordered-list": "insertOrderedList", quote: "formatBlock", heading: "formatBlock", undo: "undo", redo: "redo" }[action];
      if (command) document.execCommand(command, false, action === "heading" ? "<h2>" : action === "quote" ? "<blockquote>" : null);
      else if (action === "link") {
        var href = (prompt("链接地址（HTTPS 或站内路径）") || "").trim();
        if (!safeUrl(href)) { if (href) status.textContent = "链接地址只支持站内路径或 HTTPS 链接。"; return; }
        document.execCommand("createLink", false, href);
      } else if (action === "code") document.execCommand("insertHTML", false, "<code>" + escapeHTML(window.getSelection().toString() || "代码") + "</code>");
      else if (action === "codeblock") document.execCommand("insertHTML", false, "<pre><code>" + escapeHTML(window.getSelection().toString() || "代码") + "</code></pre>");
      else if (action === "table") document.execCommand("insertHTML", false, '<table><tbody><tr><th>列 1</th><th>列 2</th></tr><tr><td>内容</td><td>内容</td></tr></tbody></table><p><br></p>');
      else if (action === "image") {
        var url = (prompt("图片地址（站内路径或 HTTPS 链接）") || "").trim();
        if (!safeUrl(url) || url.charAt(0) === "#") { if (url) status.textContent = "图片地址只支持站内路径或 HTTPS 链接。"; return; }
        var alt = escapeHTML((prompt("图片说明（可留空）") || "").trim());
        document.execCommand("insertHTML", false, '<img src="' + escapeHTML(url) + '" alt="' + alt + '">');
      }
      markEditorDirty();
    });
  });
  richBody.addEventListener("keydown", function (event) {
    if (event.target !== richBody) return;
    if (event.key !== "Tab") return;
    event.preventDefault();
    document.execCommand("insertText", false, "  ");
  });
  var requiredFieldLabels = { "admin-post-path": "文件名", "admin-post-title": "文章标题", "admin-post-date": "发布时间" };
  editor.addEventListener("invalid", function (event) {
    var label = requiredFieldLabels[event.target.id];
    if (!label) return;
    event.target.setAttribute("aria-invalid", "true");
    status.textContent = "请先补全“" + label + "”再保存。" + (event.target.type === "datetime-local" ? "日期需要包含时间，例如 2026-10-24 08:00。" : "");
  }, true);
  editor.addEventListener("input", function (event) {
    if (event.target && event.target.hasAttribute && event.target.hasAttribute("aria-invalid")) event.target.removeAttribute("aria-invalid");
  });
  editor.addEventListener("submit", function (event) {
    event.preventDefault();
    body.value = sourceMode ? body.value : richHtmlToMarkdown();
    if (!body.value.trim()) { status.textContent = "正文不能为空。"; (sourceMode ? body : richBody).focus(); return; }
    var willPublish = publishState.value === "true";
    if (!confirm(willPublish ? "提交文章并触发网站构建？" : "将草稿保存到仓库？它不会出现在公开文章列表。")) return;
    operation(async function () {
      var target = "_posts/" + path.value.trim();
      var result = await api.adminRequest({ action: "save", path: target, sha: current && current.sha, source: sourceBase, fields: editorData(), body: body.value });
      dirty = false;
      current = Object.assign({}, current || {}, { path: target, sha: result.sha, title: fields.title.value, date: fields.date.value, fields: editorData(), body: body.value, source: result.source || sourceBase, published: publishState.value === "true" });
      await refresh();
      edit(current);
      status.textContent = result.message;
    });
  });
  app.querySelector("[data-admin-new]").addEventListener("click", function () { if (canDiscard()) edit(null); });
  app.querySelector("[data-admin-refresh]").addEventListener("click", function () { operation(refresh); });
  app.querySelector("[data-admin-delete]").addEventListener("click", function () {
    if (!current || !confirm("永久删除文章“" + current.title + "”？仓库将提交删除记录。")) return;
    operation(async function () { var result = await api.adminRequest({ action: "delete", path: current.path, sha: current.sha }); dirty = false; current = null; await refresh(); returnToList(); status.textContent = result.message; });
  });
  app.querySelector("[data-admin-download]").addEventListener("click", function () {
    operation(async function () {
      body.value = sourceMode ? body.value : richHtmlToMarkdown();
      var result = await api.adminRequest({ action: "export", source: sourceBase, fields: editorData(), body: body.value });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([result.source], { type: "text/markdown;charset=utf-8" }));
      link.download = path.value || "draft.markdown";
      link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    });
  });
  app.querySelector("[data-admin-import]").addEventListener("change", async function (event) {
    var file = event.target.files[0];
    if (!file || !canDiscard()) return;
    if (!/\.(md|markdown)$/i.test(file.name) || file.size > 512000) { status.textContent = "请选择不超过 500 KB 的 Markdown 文稿。"; return; }
    operation(async function () {
      var parsed = await api.adminRequest({ action: "parse", source: await file.text() });
      edit(null, parsed);
      path.value = file.name;
      dirty = true;
      updateSaveState();
      status.textContent = "已载入“" + file.name + "”；确认信息后即可提交。";
      event.target.value = "";
    });
  });
  app.querySelector("[data-admin-save-settings]").addEventListener("click", function () {
    if (!confirm("提交背景与音乐设置并触发网站重新构建？")) return;
    operation(async function () {
      var result = await api.adminRequest({ action: "site-settings", settings: settings });
      settingsDirty = false;
      status.textContent = result.message;
    });
  });
  app.querySelector("[data-admin-refresh-assets]").addEventListener("click", function () { operation(loadMedia); });
  app.querySelector("[data-admin-add-image]").addEventListener("click", function () {
    var selected = app.querySelector("[data-admin-image-library]").value;
    if (selected === "") return;
    var index = Number(selected);
    var asset = libraries.images[index];
    if (!asset) return;
    settings.wallpapers.push({ name: asset.name, src: asset.url, thumbnail: asset.url, position: "50% 50%" });
    settingsDirty = true;
    showSettings();
  });
  app.querySelector("[data-admin-add-audio]").addEventListener("click", function () {
    var selected = app.querySelector("[data-admin-audio-library]").value;
    if (selected === "") return;
    var index = Number(selected);
    var asset = libraries.audio[index];
    if (!asset) return;
    settings.playlist.push({ name: asset.name, artist: "", url: asset.url });
    settingsDirty = true;
    showSettings();
  });
  app.querySelectorAll("[data-admin-upload]").forEach(function (input) {
    input.addEventListener("change", function () {
      var file = input.files[0];
      if (!file) return;
      operation(async function () {
        var kind = input.getAttribute("data-admin-upload");
        var asset = await api.uploadAsset(file, kind);
        if (kind === "image") {
          libraries.images.unshift(asset);
          settings.wallpapers.push({ name: asset.name, src: asset.url, thumbnail: asset.url, position: "50% 50%" });
          fillLibrary(app.querySelector("[data-admin-image-library]"), libraries.images, "选择已上传的图片…");
        } else {
          libraries.audio.unshift(asset);
          settings.playlist.push({ name: asset.name, artist: "", url: asset.url });
          fillLibrary(app.querySelector("[data-admin-audio-library]"), libraries.audio, "选择已上传的音乐…");
        }
        settingsDirty = true;
        showSettings();
        status.textContent = "已上传“" + file.name + "”，记得保存背景与音乐设置。";
        input.value = "";
      });
    });
  });
  app.querySelector("[data-admin-login]").addEventListener("click", function () { auth.openLogin(); });
  commentMore.addEventListener("click", function () { operation(function () { return loadComments(false); }); });
  window.addEventListener("beforeunload", function (event) { if (dirty || settingsDirty) { event.preventDefault(); event.returnValue = ""; } });
  function sync() {
    var admin = auth.user && auth.isAdmin;
    gate.hidden = !!admin;
    workspace.hidden = !admin;
    var login = app.querySelector("[data-admin-login]");
    login.hidden = !!auth.user;
    if (!admin) {
      app.querySelector("[data-admin-gate-title]").textContent = !window.SW.community ? "管理服务尚未完成配置" : !auth.user ? "请使用管理员 GitHub 账号登录" : !auth.roleReady ? "正在验证管理员身份…" : "此账号没有管理权限";
      app.querySelector("[data-admin-gate-message]").textContent = window.SW.community ? "" : "管理服务尚未完成部署。";
      loadedFor = "";
      if (!auth.user) { posts = []; current = null; sourceBase = ""; body.value = ""; richBody.replaceChildren(); editor.hidden = true; app.querySelector("[data-admin-post-list]").hidden = false; path.value = ""; dirty = false; settingsDirty = false; Object.keys(fields).forEach(function (key) { fields[key].value = ""; }); app.querySelector("[data-admin-post-list]").replaceChildren(); app.querySelector("[data-admin-comment-list]").replaceChildren(); }
      return;
    }
    app.querySelector("[data-admin-account]").textContent = auth.user.user_metadata.user_name || auth.user.user_metadata.full_name || "GitHub";
    if (loadedFor === auth.user.id) return;
    loadedFor = auth.user.id;
    current = null;
    editor.hidden = true;
    app.querySelector("[data-admin-post-list]").hidden = false;
    operation(refresh);
  }
  window.addEventListener("sw:auth", sync);
  Promise.resolve(auth.ready).then(sync);
})();
