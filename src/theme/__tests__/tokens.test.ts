/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { ctaGradient, layout, palette, themes } from '../tokens';

function collect(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name === '__tests__' || name === 'assets') {
        continue;
      }
      collect(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe('theme tokens', () => {
  // Covers: HOME_LAYOUT_TC_001 — page colour and CTA gradient values match Figma
  it('[HOME_LAYOUT_TC_001] holds the Figma page colour and gradient stops', () => {
    expect(themes.light.pageBackground).toBe('#035795');
    expect(ctaGradient.stops[0].color).toBe('#FF512F');
    expect(ctaGradient.stops[1].color).toBe('#F09819');
    expect(layout.ctaWidth).toBe(307);
    expect(layout.ctaRadius).toBe(82);
  });

  it('keeps dark and high-contrast sets defined', () => {
    expect(themes.dark.pageBackground).toBe(palette.brandBlue);
    expect(themes.highContrast.textOnPage).toBe(palette.white);
  });

  // Covers: HOME_LAYOUT_TC_001 — no raw hex outside the token file (FR-021)
  it('has no raw hex colours in source outside tokens.ts', () => {
    const src = path.join(__dirname, '..', '..');
    const offenders = collect(src).filter(
      f => !f.endsWith(path.join('theme', 'tokens.ts')) &&
        /#[0-9a-fA-F]{3,8}\b/.test(fs.readFileSync(f, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
