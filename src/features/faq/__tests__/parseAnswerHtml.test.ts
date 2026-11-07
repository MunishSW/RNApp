import { parseAnswerHtml } from '../parseAnswerHtml';

describe('parseAnswerHtml', () => {
  it('gives one paragraph for plain text', () => {
    expect(parseAnswerHtml('Hello world')).toEqual([
      { kind: 'paragraph', runs: [{ text: 'Hello world' }] },
    ]);
  });

  it('gives no blocks for empty, blank, null and undefined input', () => {
    expect(parseAnswerHtml('')).toEqual([]);
    expect(parseAnswerHtml('   ')).toEqual([]);
    expect(parseAnswerHtml(null)).toEqual([]);
    expect(parseAnswerHtml(undefined)).toEqual([]);
  });

  it('sets the bold flag for b and strong', () => {
    expect(parseAnswerHtml('a <b>x</b> <strong>y</strong>')).toEqual([
      {
        kind: 'paragraph',
        runs: [{ text: 'a ' }, { text: 'x', bold: true }, { text: ' ' }, { text: 'y', bold: true }],
      },
    ]);
  });

  it('sets the italic flag for i and em (merging neighbours) and underline for u', () => {
    expect(parseAnswerHtml('<i>a</i><em>b</em><u>c</u>')).toEqual([
      {
        kind: 'paragraph',
        runs: [
          { text: 'ab', italic: true },
          { text: 'c', underline: true },
        ],
      },
    ]);
  });

  it('combines nested styles', () => {
    expect(parseAnswerHtml('<b><i>x</i></b>')).toEqual([
      { kind: 'paragraph', runs: [{ text: 'x', bold: true, italic: true }] },
    ]);
  });

  it('turns br into a line break run inside the same paragraph', () => {
    expect(parseAnswerHtml('one<br>two<br/>three')).toEqual([
      {
        kind: 'paragraph',
        runs: [{ text: 'one' }, { text: '\n' }, { text: 'two' }, { text: '\n' }, { text: 'three' }],
      },
    ]);
  });

  it('splits paragraphs at p tags', () => {
    expect(parseAnswerHtml('<p>first</p><p>second</p>')).toEqual([
      { kind: 'paragraph', runs: [{ text: 'first' }] },
      { kind: 'paragraph', runs: [{ text: 'second' }] },
    ]);
  });

  it('gives bulleted list items for ul and li', () => {
    expect(parseAnswerHtml('<ul><li>a</li><li>b</li></ul>')).toEqual([
      { kind: 'listItem', marker: '•', runs: [{ text: 'a' }] },
      { kind: 'listItem', marker: '•', runs: [{ text: 'b' }] },
    ]);
  });

  it('numbers list items for ol and restarts for each list', () => {
    expect(parseAnswerHtml('<ol><li>a</li><li>b</li></ol><ol><li>c</li></ol>')).toEqual([
      { kind: 'listItem', marker: '1.', runs: [{ text: 'a' }] },
      { kind: 'listItem', marker: '2.', runs: [{ text: 'b' }] },
      { kind: 'listItem', marker: '1.', runs: [{ text: 'c' }] },
    ]);
  });

  it('keeps text before and after a list as paragraphs', () => {
    expect(parseAnswerHtml('Intro<ul><li>a</li></ul>Outro')).toEqual([
      { kind: 'paragraph', runs: [{ text: 'Intro' }] },
      { kind: 'listItem', marker: '•', runs: [{ text: 'a' }] },
      { kind: 'paragraph', runs: [{ text: 'Outro' }] },
    ]);
  });

  it('gives a link run for a with an https href', () => {
    expect(
      parseAnswerHtml('Visit <a href="https://example.com/x?a=1&amp;b=2">our site</a> now'),
    ).toEqual([
      {
        kind: 'paragraph',
        runs: [
          { text: 'Visit ' },
          { text: 'our site', href: 'https://example.com/x?a=1&b=2' },
          { text: ' now' },
        ],
      },
    ]);
  });

  it('accepts single quoted hrefs and tel and mailto links', () => {
    const blocks = parseAnswerHtml(
      "<a href='tel:1800123'>call</a> <a href=\"mailto:a@b.in\">mail</a>",
    );
    expect(blocks[0].runs.map(r => r.href)).toEqual(['tel:1800123', undefined, 'mailto:a@b.in']);
  });

  it('keeps the text but drops the link for an unsafe href', () => {
    expect(parseAnswerHtml('<a href="javascript:alert(1)">tap</a>')).toEqual([
      { kind: 'paragraph', runs: [{ text: 'tap' }] },
    ]);
  });

  it('drops unknown tags and keeps their text', () => {
    expect(
      parseAnswerHtml('<div class="x">Hello <span style="color:red">big</span> <h1>world</h1></div>'),
    ).toEqual([{ kind: 'paragraph', runs: [{ text: 'Hello big world' }] }]);
  });

  it('removes script and style content completely', () => {
    const blocks = parseAnswerHtml('a<script>alert("x")</script>b<style>.x{color:red}</style>c');
    const text = blocks.flatMap(b => b.runs.map(r => r.text)).join('');
    expect(text).toBe('abc');
  });

  it('removes everything after an unclosed script tag', () => {
    expect(parseAnswerHtml('keep<script>alert(1)')).toEqual([
      { kind: 'paragraph', runs: [{ text: 'keep' }] },
    ]);
  });

  it('decodes the common entities', () => {
    expect(
      parseAnswerHtml('Tom &amp; Jerry &lt;3&gt; a&nbsp;b &quot;q&quot; &#39;s&#39; &#x41;'),
    ).toEqual([{ kind: 'paragraph', runs: [{ text: 'Tom & Jerry <3> a b "q" \'s\' A' }] }]);
  });

  it('never decodes an entity into markup that is parsed again', () => {
    expect(parseAnswerHtml('&lt;b&gt;x&lt;/b&gt;')).toEqual([
      { kind: 'paragraph', runs: [{ text: '<b>x</b>' }] },
    ]);
  });

  it('collapses source whitespace and newlines to single spaces', () => {
    expect(parseAnswerHtml('  a \n\n  b\t c  ')).toEqual([
      { kind: 'paragraph', runs: [{ text: 'a b c' }] },
    ]);
  });

  it('ignores comments and treats a lone less-than sign as text', () => {
    const blocks = parseAnswerHtml('a<!-- hidden -->b 1 < 2');
    expect(blocks.flatMap(b => b.runs.map(r => r.text)).join('')).toBe('ab 1 < 2');
  });
});
