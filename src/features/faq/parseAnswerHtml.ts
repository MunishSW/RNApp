import { LIST_BULLET } from './faqConstants';

/** One piece of text with its style flags. A link run carries the (safe) href. */
export interface AnswerRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
}

export type AnswerBlock =
  | { kind: 'paragraph'; runs: AnswerRun[] }
  | { kind: 'listItem'; marker: string; runs: AnswerRun[] };

const TOKEN = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|[^<]+|</g;
const SAFE_HREF = /^(https?:|mailto:|tel:)/i;
const DROP_CONTENT = new Set(['script', 'style']);

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  nbsp: ' ',
  quot: '"',
  apos: "'",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

function readHref(attributes: string): string | undefined {
  const match = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes);
  if (!match) {
    return undefined;
  }
  const href = decodeEntities((match[1] ?? match[2] ?? match[3] ?? '').trim());
  return SAFE_HREF.test(href) ? href : undefined;
}

interface OpenBlock {
  kind: 'paragraph' | 'listItem';
  marker?: string;
  runs: AnswerRun[];
}

/**
 * Converts simple answer HTML into styled blocks (FR-4.3-01, BR-5). The input is untrusted: nothing is
 * executed, script and style content is removed, unknown tags are dropped with their text kept, and only
 * http, https, mailto and tel links survive.
 */
export function parseAnswerHtml(html?: string | null): AnswerBlock[] {
  if (typeof html !== 'string' || html.length === 0) {
    return [];
  }

  const blocks: AnswerBlock[] = [];
  let current: OpenBlock | null = null;
  let bold = 0;
  let italic = 0;
  let underline = 0;
  const hrefs: Array<string | undefined> = [];
  const lists: Array<{ ordered: boolean; count: number }> = [];

  const flush = () => {
    const block = current;
    current = null;
    if (!block) {
      return;
    }
    const runs = block.runs.filter(run => run.text.length > 0);
    if (runs.length === 0) {
      return;
    }
    runs[0] = { ...runs[0], text: runs[0].text.replace(/^ +/, '') };
    const last = runs.length - 1;
    runs[last] = { ...runs[last], text: runs[last].text.replace(/ +$/, '') };
    const cleaned = runs.filter(run => run.text.length > 0);
    if (cleaned.length === 0) {
      return;
    }
    blocks.push(
      block.kind === 'listItem'
        ? { kind: 'listItem', marker: block.marker ?? LIST_BULLET, runs: cleaned }
        : { kind: 'paragraph', runs: cleaned },
    );
  };

  const addRun = (text: string) => {
    if (!current) {
      current = { kind: 'paragraph', runs: [] };
    }
    const runs = current.runs;
    let value = text;
    const last = runs[runs.length - 1];
    if (value.startsWith(' ') && last && last.text.endsWith(' ')) {
      value = value.slice(1);
    }
    if (value.length === 0) {
      return;
    }
    const run: AnswerRun = { text: value };
    if (bold > 0) {
      run.bold = true;
    }
    if (italic > 0) {
      run.italic = true;
    }
    if (underline > 0) {
      run.underline = true;
    }
    const href = hrefs[hrefs.length - 1];
    if (href) {
      run.href = href;
    }
    if (
      last &&
      value !== '\n' &&
      last.text !== '\n' &&
      last.bold === run.bold &&
      last.italic === run.italic &&
      last.underline === run.underline &&
      last.href === run.href
    ) {
      last.text += run.text;
      return;
    }
    runs.push(run);
  };

  let match: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(html)) !== null) {
    const [token, closing, rawName, attributes] = match;
    if (rawName === undefined) {
      if (token.startsWith('<!--')) {
        continue;
      }
      const text = decodeEntities(token.replace(/\s+/g, ' '));
      if (text.length > 0) {
        addRun(text);
      }
      continue;
    }
    const name = rawName.toLowerCase();
    const isClosing = closing === '/';

    if (!isClosing && DROP_CONTENT.has(name)) {
      const end = new RegExp(`</${name}\\s*>`, 'i');
      const rest = html.slice(TOKEN.lastIndex);
      const found = end.exec(rest);
      TOKEN.lastIndex = found ? TOKEN.lastIndex + found.index + found[0].length : html.length;
      continue;
    }

    switch (name) {
      case 'b':
      case 'strong':
        bold = Math.max(0, bold + (isClosing ? -1 : 1));
        break;
      case 'i':
      case 'em':
        italic = Math.max(0, italic + (isClosing ? -1 : 1));
        break;
      case 'u':
        underline = Math.max(0, underline + (isClosing ? -1 : 1));
        break;
      case 'a':
        if (isClosing) {
          hrefs.pop();
        } else {
          hrefs.push(readHref(attributes));
        }
        break;
      case 'br':
        if (!isClosing) {
          addRun('\n');
        }
        break;
      case 'p':
        flush();
        break;
      case 'ul':
      case 'ol':
        flush();
        if (isClosing) {
          lists.pop();
        } else {
          lists.push({ ordered: name === 'ol', count: 0 });
        }
        break;
      case 'li':
        flush();
        if (!isClosing) {
          const list = lists[lists.length - 1];
          let marker = LIST_BULLET;
          if (list?.ordered) {
            list.count += 1;
            marker = `${list.count}.`;
          }
          current = { kind: 'listItem', marker, runs: [] };
        }
        break;
      default:
        break;
    }
  }
  flush();
  return blocks;
}
