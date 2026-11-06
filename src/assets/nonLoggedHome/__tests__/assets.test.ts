/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { nonLoggedHomeAssets } from '../index';

describe('Figma assets', () => {
  // Covers: HOME_LAYOUT_TC_001 — real exported assets resolve (FR-022)
  it('[HOME_LAYOUT_TC_001] resolves the illustration and six tile icons', () => {
    const keys = Object.keys(nonLoggedHomeAssets);
    expect(keys).toEqual([
      'illustration',
      'payNow',
      'ourProducts',
      'trackApplication',
      'faqs',
      'offers',
      'contactUs',
    ]);
    keys.forEach(k => {
      expect(
        (nonLoggedHomeAssets as Record<string, unknown>)[k],
      ).toBeDefined();
    });
  });

  it('has non-empty local files for every asset', () => {
    ['illustration', 'pay-now', 'our-products', 'track-application', 'faqs', 'offers', 'contact-us'].forEach(
      name => {
        const size = fs.statSync(path.join(__dirname, '..', `${name}.png`)).size;
        expect(size).toBeGreaterThan(500);
      },
    );
  });
});
