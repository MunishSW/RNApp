/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

const FEATURE_DIR = path.join(__dirname, '..');
const CONSTANTS = 'faqConstants.ts';

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name !== '__tests__') {
        sourceFiles(full, out);
      }
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

const files = sourceFiles(FEATURE_DIR);
const rel = (file: string) => path.relative(FEATURE_DIR, file);
/** Source without comments, so a word in a doc comment is not mistaken for code. */
const read = (file: string) =>
  fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('FAQ feature scope rules', () => {
  it('has source files to check', () => {
    expect(files.length).toBeGreaterThanOrEqual(9);
  });

  it('has no raw hex colours', () => {
    const offenders = files.filter(f => /#[0-9a-fA-F]{3,8}\b/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('imports nothing from the Home features', () => {
    const offenders = files.filter(f =>
      /from\s+['"][^'"]*\/(nonLoggedInHome|nonLoggedHome)(\/|['"])/.test(read(f)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('makes no direct axios or fetch call and uses no WebView', () => {
    const offenders = files.filter(f => {
      const text = read(f);
      return (
        /from\s+['"]axios['"]/.test(text) ||
        /(^|[^.\w])fetch\s*\(/.test(text) ||
        /webview/i.test(text)
      );
    });
    expect(offenders.map(rel)).toEqual([]);
  });

  it('keeps literal on-screen text out of the components and the screen', () => {
    const offenders = files
      .filter(f => /\.tsx$/.test(f) && path.basename(f) !== CONSTANTS)
      .filter(f => /<Text[^>]*>\s*[A-Za-z]/.test(read(f).split('=>').join('')));
    expect(offenders.map(rel)).toEqual([]);
  });
});
