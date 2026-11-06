/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { ctaGradient, faqLayout, layout, palette, themes, typography } from '../tokens';

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
  // Covers: HOME_LAYOUT_TC_001 - page colour and CTA gradient values match Figma
  it('[HOME_LAYOUT_TC_001] holds the Figma page colour and gradient stops', () => {
    expect(themes.light.pageBackground).toBe('#035795');
    expect(ctaGradient.stops[0].color).toBe('#FF512F');
    expect(ctaGradient.stops[1].color).toBe('#F09819');
    expect(layout.ctaWidth).toBe(307);
    expect(layout.ctaRadius).toBe(82);
  });

  // four Rubik weights and Figma layout numbers (spec 002, T001) (FR-004, FR-020)
  it('holds the four Rubik family tokens and the Figma tile and icon sizes', () => {
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

  // every token resolves in dark and high contrast; brand CTA is exempt (FR-006, FR-023, FR-068, E-03)
  it('resolves every token in the dark and high-contrast sets and keeps the CTA exempt from remapping', () => {
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

  it('holds the FAQ page and chevron colours in every set and the FAQ Figma sizes', () => {
    (['light', 'dark', 'highContrast'] as const).forEach(name => {
      expect(themes[name].faqPageBackground).toBe('#E3ECF5');
      expect(themes[name].faqChevron).toBe('#FF5101');
      expect(themes[name].faqActionBar).toBe('#035795');
    });
    expect(faqLayout.actionBarHeight).toBe(48);
    expect(faqLayout.cardRadius).toBe(4);
    expect(faqLayout.cardPadding).toBe(12);
    expect(faqLayout.cardGap).toBe(8);
    expect(faqLayout.listSide).toBe(18);
    expect(faqLayout.listTop).toBe(12);
    expect(faqLayout.chevronSize).toBe(20);
    expect(faqLayout.chevronGap).toBe(7);
    expect(faqLayout.questionFontSize).toBe(12);
    expect(faqLayout.questionLineHeight).toBe(18);
    expect(faqLayout.columnMaxWidth).toBe(360);
  });

  // no raw hex colours in source outside tokens.ts
  it('has no raw hex colours in source outside tokens.ts', () => {
    const src = path.join(__dirname, '..', '..');
    const offenders = collect(src).filter(
      f => !f.endsWith(path.join('theme', 'tokens.ts')) &&
        /#[0-9a-fA-F]{3,8}\b/.test(fs.readFileSync(f, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
