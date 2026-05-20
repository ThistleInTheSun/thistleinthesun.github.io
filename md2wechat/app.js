/* Markdown -> WeChat 公众号排版工具
 * 使用 marked + highlight.js，在客户端将 Markdown 渲染为带内联样式的 HTML，
 * 便于直接复制到微信公众号编辑器粘贴。
 */
(function () {
  'use strict';

  // ------------------------- 主题定义 -------------------------
  // 微信公众号编辑器对外联样式不友好，必须使用内联 style，
  // 因此每个主题以 JSON 形式描述各元素的内联样式。
  const THEMES = {
    default: {
      name: '默认蓝',
      primary: '#5b8def',
      light: '#eef3ff',
      base: {
        color: '#3f3f3f',
        lineHeight: '1.75',
        letterSpacing: '0.5px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
      }
    },
    elegant: {
      name: '优雅绿',
      primary: '#3aa675',
      light: '#e8f5ee',
      base: {
        color: '#333',
        lineHeight: '1.8',
        letterSpacing: '0.6px',
        fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif'
      }
    },
    warm: {
      name: '温暖橙',
      primary: '#e8743b',
      light: '#fdf1e7',
      base: {
        color: '#3a3a3a',
        lineHeight: '1.75',
        letterSpacing: '0.5px',
        fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
      }
    },
    mono: {
      name: '极简灰',
      primary: '#444',
      light: '#f0f0f0',
      base: {
        color: '#222',
        lineHeight: '1.8',
        letterSpacing: '0.4px',
        fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
      }
    }
  };

  // 把 style 对象转为 CSS 字符串
  function s(obj) {
    return Object.entries(obj)
      .map(([k, v]) => k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + v)
      .join(';');
  }

  // 根据主题构造每种元素的内联样式
  function buildStyles(themeKey, fontSize) {
    const t = THEMES[themeKey] || THEMES.default;
    const base = t.base;
    return {
      h1: s({
        fontSize: '22px',
        fontWeight: 'bold',
        color: t.primary,
        margin: '24px 0 16px',
        textAlign: 'center',
        borderBottom: `2px solid ${t.primary}`,
        paddingBottom: '8px',
        lineHeight: '1.4'
      }),
      h2: s({
        fontSize: '19px',
        fontWeight: 'bold',
        color: '#fff',
        background: t.primary,
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: '4px',
        margin: '24px 0 14px',
        lineHeight: '1.5'
      }),
      h3: s({
        fontSize: '17px',
        fontWeight: 'bold',
        color: t.primary,
        margin: '20px 0 12px',
        paddingLeft: '10px',
        borderLeft: `4px solid ${t.primary}`,
        lineHeight: '1.5'
      }),
      h4: s({
        fontSize: '15px',
        fontWeight: 'bold',
        color: t.primary,
        margin: '18px 0 10px',
        lineHeight: '1.5'
      }),
      h5: s({
        fontSize: '14px',
        fontWeight: 'bold',
        color: t.primary,
        margin: '16px 0 8px'
      }),
      h6: s({
        fontSize: '13px',
        fontWeight: 'bold',
        color: t.primary,
        margin: '14px 0 8px'
      }),
      p: s({
        fontSize: fontSize,
        color: base.color,
        lineHeight: base.lineHeight,
        letterSpacing: base.letterSpacing,
        margin: '14px 0',
        textAlign: 'justify'
      }),
      blockquote: s({
        borderLeft: `4px solid ${t.primary}`,
        background: t.light,
        color: '#555',
        padding: '10px 14px',
        margin: '16px 0',
        fontSize: fontSize,
        lineHeight: base.lineHeight,
        borderRadius: '0 4px 4px 0'
      }),
      ul: s({
        margin: '14px 0',
        paddingLeft: '24px',
        fontSize: fontSize,
        color: base.color,
        lineHeight: base.lineHeight
      }),
      ol: s({
        margin: '14px 0',
        paddingLeft: '24px',
        fontSize: fontSize,
        color: base.color,
        lineHeight: base.lineHeight
      }),
      li: s({
        margin: '6px 0'
      }),
      a: s({
        color: t.primary,
        textDecoration: 'underline',
        wordBreak: 'break-all'
      }),
      strong: s({ color: t.primary, fontWeight: 'bold' }),
      em: s({ fontStyle: 'italic', color: '#555' }),
      del: s({ color: '#999' }),
      hr: s({
        border: 'none',
        borderTop: `1px dashed ${t.primary}`,
        margin: '24px 0'
      }),
      img: s({
        maxWidth: '100%',
        display: 'block',
        margin: '16px auto',
        borderRadius: '4px'
      }),
      code_inline: s({
        background: t.light,
        color: t.primary,
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '90%',
        fontFamily: 'ui-monospace, Menlo, Consolas, monospace'
      }),
      pre: s({
        background: '#f6f8fa',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '14px 16px',
        margin: '16px 0',
        overflowX: 'auto',
        fontSize: '13px',
        lineHeight: '1.6',
        fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
        color: '#24292e',
        whiteSpace: 'pre'
      }),
      table: s({
        borderCollapse: 'collapse',
        margin: '16px 0',
        width: '100%',
        fontSize: '14px'
      }),
      th: s({
        border: '1px solid #ddd',
        background: t.light,
        color: t.primary,
        padding: '6px 10px',
        textAlign: 'left'
      }),
      td: s({
        border: '1px solid #ddd',
        padding: '6px 10px'
      }),
      wrapper: s({
        ...base,
        fontSize: fontSize,
        padding: '0 4px'
      })
    };
  }

  // ------------------------- marked 配置 -------------------------
  // 自定义 renderer 为每个 HTML 标签注入主题的内联 style
  function makeRenderer(styles) {
    const r = new marked.Renderer();
    r.heading = (text, level) => {
      const tag = 'h' + level;
      const st = styles[tag];
      // h2 使用 inline-block + 块级容器，避免被换行影响
      if (level === 2) {
        return `<p style="margin:24px 0 14px"><span style="${st}">${text}</span></p>`;
      }
      return `<${tag} style="${st}">${text}</${tag}>`;
    };
    r.paragraph = text => `<p style="${styles.p}">${text}</p>`;
    r.blockquote = quote => `<blockquote style="${styles.blockquote}">${quote}</blockquote>`;
    r.list = (body, ordered) => {
      const tag = ordered ? 'ol' : 'ul';
      return `<${tag} style="${styles[tag]}">${body}</${tag}>`;
    };
    r.listitem = text => `<li style="${styles.li}">${text}</li>`;
    r.link = (href, title, text) =>
      `<a style="${styles.a}" href="${href}"${title ? ` title="${title}"` : ''}>${text}</a>`;
    r.strong = text => `<strong style="${styles.strong}">${text}</strong>`;
    r.em = text => `<em style="${styles.em}">${text}</em>`;
    r.del = text => `<del style="${styles.del}">${text}</del>`;
    r.hr = () => `<hr style="${styles.hr}" />`;
    r.image = (href, title, text) =>
      `<img style="${styles.img}" src="${href}" alt="${text || ''}"${title ? ` title="${title}"` : ''} />`;
    r.codespan = code => `<code style="${styles.code_inline}">${code}</code>`;
    r.code = (code, lang) => {
      let highlighted = escapeHtml(code);
      if (lang && window.hljs && hljs.getLanguage(lang)) {
        try {
          highlighted = hljs.highlight(code, { language: lang }).value;
        } catch (_) { /* 忽略高亮错误 */ }
      }
      return `<pre style="${styles.pre}"><code class="hljs language-${lang || 'plain'}">${highlighted}</code></pre>`;
    };
    r.table = (header, body) =>
      `<table style="${styles.table}"><thead>${header}</thead><tbody>${body}</tbody></table>`;
    r.tablerow = content => `<tr>${content}</tr>`;
    r.tablecell = (content, flags) => {
      const tag = flags.header ? 'th' : 'td';
      return `<${tag} style="${styles[tag]}">${content}</${tag}>`;
    };
    return r;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ------------------------- DOM -------------------------
  const $input = document.getElementById('input');
  const $preview = document.getElementById('preview');
  const $theme = document.getElementById('theme');
  const $font = document.getElementById('font');
  const $count = document.getElementById('char-count');
  const $toast = document.getElementById('toast');

  function render() {
    const styles = buildStyles($theme.value, $font.value);
    marked.use({ renderer: makeRenderer(styles), breaks: true, gfm: true });
    const md = $input.value || '';
    const html = marked.parse(md);
    // 用一个外层 section 包裹，统一字体与行高（粘贴公众号会保留外层 style）
    $preview.innerHTML = `<section style="${styles.wrapper}">${html}</section>`;
    $count.textContent = `${md.length} 字符`;
    saveDraft(md);
  }

  // ------------------------- 复制到剪贴板 -------------------------
  // 必须以 text/html 形式写入剪贴板，公众号才会保留富文本格式
  async function copyRichHTML() {
    const html = $preview.innerHTML;
    const plain = $preview.innerText;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([plain], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })
        ]);
      } else {
        // 兜底：使用 execCommand
        const range = document.createRange();
        range.selectNodeContents($preview);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
      }
      toast('已复制，到公众号编辑器直接粘贴即可');
    } catch (e) {
      console.error(e);
      toast('复制失败，请手动选择预览区复制');
    }
  }

  function toast(msg) {
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => $toast.classList.remove('show'), 1800);
  }

  // ------------------------- 草稿持久化 -------------------------
  const KEY = 'md2wechat:draft';
  const KEY_THEME = 'md2wechat:theme';
  const KEY_FONT = 'md2wechat:font';
  function saveDraft(v) { try { localStorage.setItem(KEY, v); } catch (_) {} }
  function loadDraft() { try { return localStorage.getItem(KEY) || ''; } catch (_) { return ''; } }

  // ------------------------- 示例文本 -------------------------
  const SAMPLE = `# 这是一篇示例文章

> 粘贴 Markdown，右侧实时预览，一键复制到公众号编辑器。

## 一、为什么需要这个工具

公众号原生编辑器排版能力有限，而 Markdown 简洁高效。本工具帮你**自动**转换成公众号可粘贴的富文本。

### 主要特性

- **多主题切换**：默认蓝 / 优雅绿 / 温暖橙 / 极简灰
- **代码高亮**：基于 highlight.js
- **一键复制**：以富文本形式写入剪贴板
- **本地草稿**：自动保存到浏览器，不上传任何数据

## 二、代码示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
  return { ok: true };
}

hello('公众号');
\`\`\`

行内代码也支持：\`const answer = 42;\`

## 三、表格

| 主题 | 主色 | 适合场景 |
|:----|:----|:--------|
| 默认蓝 | #5b8def | 科技、产品 |
| 优雅绿 | #3aa675 | 阅读、文学 |
| 温暖橙 | #e8743b | 生活、情感 |
| 极简灰 | #444 | 严肃、商务 |

## 四、其他

[这是一个链接](https://thistleinthesun.github.io)，**加粗**、*斜体*、~~删除线~~ 都可用。

---

> 写作愉快 ✍️
`;

  // ------------------------- 事件 -------------------------
  document.getElementById('btn-sample').addEventListener('click', () => {
    $input.value = SAMPLE;
    render();
  });
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (!$input.value || confirm('确定清空当前内容？')) {
      $input.value = '';
      render();
    }
  });
  document.getElementById('btn-copy').addEventListener('click', copyRichHTML);

  $input.addEventListener('input', render);
  $theme.addEventListener('change', () => {
    try { localStorage.setItem(KEY_THEME, $theme.value); } catch (_) {}
    render();
  });
  $font.addEventListener('change', () => {
    try { localStorage.setItem(KEY_FONT, $font.value); } catch (_) {}
    render();
  });

  // ------------------------- 初始化 -------------------------
  try {
    const t = localStorage.getItem(KEY_THEME);
    if (t && THEMES[t]) $theme.value = t;
    const f = localStorage.getItem(KEY_FONT);
    if (f) $font.value = f;
  } catch (_) {}

  $input.value = loadDraft() || SAMPLE;
  render();
})();
