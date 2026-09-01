import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';
import katex from 'katex';

const isExternalHref = (href: string) => /^(https?:)?\/\//i.test(href);

const rewriteImportedHref = (href: string) =>
  href.replace(/^http:\/\/(fernkit\.in\/)/i, 'https://$1');

const sanitizeImportedHtml = (html: string) =>
  html.replace(/<a\b([^>]*)>/gi, (tag, attrs: string) => {
    const hrefMatch = /\bhref="([^"]*)"/i.exec(attrs);
    if (!hrefMatch) return tag;
    const href = rewriteImportedHref(hrefMatch[1]);
    const extra = isExternalHref(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${extra}>`;
  });

marked.use(
  markedKatex({
    throwOnError: false,
    output: 'html',
  }),
);

const renderer = new marked.Renderer();

renderer.code = function ({
  text,
  lang,
}: {
  text: string;
  lang?: string;
  escaped?: boolean;
}) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch (err) {
      console.error('Highlight error:', err);
    }
  }

  const highlighted = hljs.highlightAuto(text).value;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
};

renderer.image = function ({
  href,
  title,
  text,
}: {
  href: string | null;
  title?: string | null;
  text: string;
}) {
  if (!href) return text;
  const titleAttr = title ? ` title="${title}"` : '';
  return `<img src="${href}" alt="${text}"${titleAttr} class="blog-image" loading="lazy" />`;
};

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
});

export type TocItem = {
  depth: number;
  text: string;
  id: string;
};

export type TocNode = {
  item: TocItem;
  children: TocItem[];
};

export const nestToc = (items: TocItem[]): TocNode[] => {
  const roots: TocNode[] = [];
  let currentSection: TocNode | undefined;

  for (const item of items) {
    if (item.depth <= 2) {
      const node: TocNode = { item, children: [] };
      roots.push(node);
      currentSection = item.depth === 2 ? node : undefined;
    } else if (currentSection) {
      currentSection.children.push(item);
    } else {
      roots.push({ item, children: [] });
    }
  }

  // A wrapping H2 (often the title repeated) with several H3s should not
  // hide the sidebar. Promote the subsections so they become the TOC.
  if (roots.length === 1 && roots[0].children.length >= 2) {
    return roots[0].children.map((child) => ({ item: child, children: [] }));
  }

  return roots;
};

export const hasWritingToc = (items: TocItem[]) => nestToc(items).length >= 2;

const stripTags = (value: string) => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const slugify = (value: string, used: Map<string, number>) => {
  const base =
    stripTags(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
};

const collectHeadings = (html: string): { html: string; headings: TocItem[] } => {
  const used = new Map<string, number>();
  const headings: TocItem[] = [];
  const next = html.replace(/<h([1-4])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (_, depth, attrs = '', inner) => {
    const text = decodeHtmlEntities(stripTags(inner));
    if (!text) return `<h${depth}${attrs}>${inner}</h${depth}>`;
    const existing = /id="([^"]+)"/.exec(attrs);
    const id = existing?.[1] ?? slugify(text, used);
    const level = Number(depth);
    if (level >= 2 && level <= 3) {
      headings.push({ depth: level, text, id });
    }
    const cleaned = attrs.replace(/\s*id="[^"]*"/, '');
    return `<h${depth}${cleaned} id="${id}">${inner}</h${depth}>`;
  });
  return { html: next, headings };
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");

const renderLatexPreview = (latex: string): string => {
  const decoded = decodeHtmlEntities(latex.trim());
  try {
    return katex.renderToString(decoded, {
      throwOnError: false,
      displayMode: true,
    });
  } catch {
    return `<pre class="blog-latex-fallback">${decoded}</pre>`;
  }
};

export const preprocessHashnodeMarkdown = (
  markdown: string,
): { content: string; placeholders: string[] } => {
  let content = sanitizeImportedHtml(markdown);
  const placeholders: string[] = [];
  const stash = (html: string) => {
    const token = `@@BLOG_HTML_${placeholders.length}@@`;
    placeholders.push(html);
    return token;
  };

  content = content.replace(/<details\b[^>]*>[\s\S]*?<\/details>/gi, (block) => {
    const withLatex = block.replace(
      /<latex-preview\b[^>]*>([\s\S]*?)<\/latex-preview>/gi,
      (_, latex: string) => renderLatexPreview(latex),
    );
    const cleaned = withLatex
      .replace(/\s+isuploading="[^"]*"/gi, '')
      .replace(/\s+align="[^"]*"/gi, '')
      .replace(/<img\b([^>]*?)>/gi, '<img$1 class="blog-image" loading="lazy">');
    return stash(sanitizeImportedHtml(cleaned));
  });

  content = content.replace(
    /<latex-preview\b[^>]*>([\s\S]*?)<\/latex-preview>/gi,
    (_, latex: string) => stash(renderLatexPreview(latex)),
  );

  content = content.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const cleaned = imgTag
      .replace(/\s+isuploading="[^"]*"/gi, '')
      .replace(/\s+align="[^"]*"/gi, '');
    if (/class="/i.test(cleaned)) return stash(cleaned);
    return stash(cleaned.replace(/<img\b/i, '<img class="blog-image" loading="lazy"'));
  });

  content = content.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\s+align="[^"]+"\)/g,
    '![$1]($2)',
  );

  return { content, placeholders };
};

export const renderBlogMarkdown = async (
  markdown: string,
): Promise<{ html: string; headings: TocItem[] }> => {
  const { content, placeholders } = preprocessHashnodeMarkdown(markdown);
  let html = await marked.parse(content);

  placeholders.forEach((htmlBlock, index) => {
    html = html.replace(`@@BLOG_HTML_${index}@@`, htmlBlock);
    html = html.replace(`<p>@@BLOG_HTML_${index}@@</p>`, htmlBlock);
  });

  html = html
    .replace(/<table>/g, '<div class="table-wrapper"><table>')
    .replace(/<\/table>/g, '</table></div>');

  return collectHeadings(wrapKatexDisplay(html));
};

const wrapKatexDisplay = (html: string): string => {
  const start = '<span class="katex-display">';
  let last = 0;
  let out = '';

  while (last < html.length) {
    const open = html.indexOf(start, last);
    if (open === -1) {
      out += html.slice(last);
      break;
    }

    out += html.slice(last, open);
    let pos = open + start.length;
    let depth = 1;
    while (pos < html.length && depth > 0) {
      const nextOpen = html.indexOf('<span', pos);
      const nextClose = html.indexOf('</span>', pos);
      if (nextClose === -1) {
        pos = html.length;
        break;
      }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        pos = nextOpen + 5;
      } else {
        depth -= 1;
        pos = nextClose + 7;
      }
    }
    out += `<div class="math-scroll">${html.slice(open, pos)}</div>`;
    last = pos;
  }

  return out;
};
