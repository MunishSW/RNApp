/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

const FEATURE_DIR = path.join(__dirname, '..');
const CONSTANTS = 'nonLoggedInHomeConstants.ts';

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
/** Source without comments, so a quoted string in a doc comment is not mistaken for UI text. */
const read = (file: string) =>
  fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
const rel = (file: string) => path.relative(FEATURE_DIR, file);

describe('feature isolation and rules (plan Structure Decision; constitution I, II, V)', () => {
  it('has source files to check', () => {
    expect(files.length).toBeGreaterThan(15);
  });

  // The duplicate feature must not depend on spec 001's folder
  it('imports nothing from features/nonLoggedHome', () => {
    const offenders = files.filter(f => /from\s+['"][^'"]*\/nonLoggedHome(\/|['"])/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  // Constitution II: no raw colours in the feature
  it('has no raw hex or rgb colours', () => {
    const offenders = files.filter(f => /#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  // Constitution V: all calls go through the shared client; the feature never uses the HTTP library or fetch
  it('makes no direct axios or fetch calls', () => {
    const offenders = files.filter(f => /from\s+['"]axios['"]|\bfetch\s*\(|\bXMLHttpRequest\b/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  // Constitution I: no literal user-facing strings outside the label file
  it('keeps user-facing text out of components', () => {
    const offenders = files
      .filter(f => path.basename(f) !== CONSTANTS && f.endsWith('.tsx'))
      .filter(f => {
        const code = read(f);
        const jsxText = />\s*[A-Za-z][A-Za-z ,.!']*\s*<\//.test(code);
        const literalProp = /\b(accessibilityLabel|accessibilityHint|title|placeholder)="[^"]+"/.test(code);
        return jsxText || literalProp;
      });
    expect(offenders.map(rel)).toEqual([]);
  });

  // Security (BRD 6.4, 7.3): no credential, token or header value is logged; no X-BHFL-Auth in the feature
  it('does not log secrets and never mentions X-BHFL-Auth', () => {
    const offenders = files.filter(f => /console\.(log|info|debug|warn|error)\s*\(/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
    expect(files.filter(f => /X-BHFL-Auth/.test(read(f))).map(rel)).toEqual([]);
  });

  it('keeps the label file as the only place that holds the quoted screen strings', () => {
    const outside = files.filter(
      f =>
        path.basename(f) !== CONSTANTS &&
        /We are here to help!|Are you sure you want to exit!|Your request could not be processed/.test(read(f)),
    );
    expect(outside.map(rel)).toEqual([]);
  });
});
