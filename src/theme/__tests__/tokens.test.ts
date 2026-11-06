/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { ctaGradient, layout, palette, themes, typography } from '../tokens';

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

  // Covers: FR-4.1-04, FR-4.3-01 - four Rubik weights and Figma layout numbers (spec 002, T001)
  it('[T001] holds the four Rubik family tokens and the Figma tile and icon sizes', () => {
    expect(typography.fontFamilyRegular).toBe('Rubik-Regular');
    expect(typography.fontFamilyMedium).toBe('Rubik-Medium');
    expect(typography.fontFamilySemiBold).toBe('Rubik-SemiBold');
    expect(typography.fontFamilyBold).toBe('Rubik-Bold');
    expect(layout.tileWidth).toBe(96);
    expect(layout.iconHeight).toBe(40);
    expect(ctaGradient.angleDeg).toBeCloseTo(133.8255, 3);
    expect(ctaGradient.stops[0].offset).toBeCloseTo(0.055578, 5);
    expect(ctaGradient.stops[1].offset).toBeCloseTo(0.94442, 5);
  });

  // Covers: FR-4.1-06, FR-4.3-04, FR-7.4-03, E-03, TC-605 - every token resolves in dark and high contrast; brand CTA is exempt
  it('[T064] resolves every token in the dark and high-contrast sets and keeps the CTA exempt from remapping', () => {
    const keys = Object.keys(themes.light) as Array<keyof typeof themes.light>;
    (['dark', 'highContrast'] as const).forEach(name => {
      keys.forEach(key => {
        expect(typeof themes[name][key]).toBe('string');
        expect(themes[name][key].length).toBeGreaterThan(0);
      });
      expect(themes[name].ctaText).toBe(palette.white);
    });
    // The CTA gradient is a fixed brand constant, not part of the remappable theme sets.
    expect(Object.keys(themes.light)).not.toContain('ctaGradient');
    expect(ctaGradient.stops.map(stop => stop.color)).toEqual([palette.ctaStart, palette.ctaEnd]);
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
