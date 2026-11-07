/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { backArrowXml, chevronDownXml } from '..';

const dir = path.join(__dirname, '..');

describe('faq assets', () => {
  it('exports the back arrow markup with a 21 x 18 svg root', () => {
    expect(backArrowXml.startsWith('<svg')).toBe(true);
    expect(backArrowXml).toContain('width="21"');
    expect(backArrowXml).toContain('height="18"');
    expect(backArrowXml).toContain('viewBox="0 0 21 18"');
  });

  it('exports the chevron markup with a 20 x 20 svg root', () => {
    expect(chevronDownXml.startsWith('<svg')).toBe(true);
    expect(chevronDownXml).toContain('width="20"');
    expect(chevronDownXml).toContain('height="20"');
    expect(chevronDownXml).toContain('viewBox="0 0 20 20"');
  });

  it('matches the downloaded svg files exactly', () => {
    expect(backArrowXml).toBe(fs.readFileSync(path.join(dir, 'back-arrow.svg'), 'utf8').trim());
    expect(chevronDownXml).toBe(fs.readFileSync(path.join(dir, 'chevron-down.svg'), 'utf8').trim());
  });
});
