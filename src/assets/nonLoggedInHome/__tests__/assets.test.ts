/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { nonLoggedInHomeAssets } from '../index';

describe('nonLoggedInHome assets', () => {
  // Covers: FR-4.1-02, FR-4.2-01 - illustration and six tile icons resolve
  it('resolves the illustration and the six tile icons', () => {
    expect(Object.keys(nonLoggedInHomeAssets)).toEqual([
      'illustration',
      'payNow',
      'ourProducts',
      'trackApplication',
      'faqs',
      'offers',
      'contactUs',
    ]);
  });

  it('has a non-empty local file for every asset', () => {
    [
      'illustration',
      'pay-now',
      'our-products',
      'track-application',
      'faqs',
      'offers',
      'contact-us',
    ].forEach(name => {
      const size = fs.statSync(path.join(__dirname, '..', `${name}.png`)).size;
      expect(size).toBeGreaterThan(500);
    });
  });
});
