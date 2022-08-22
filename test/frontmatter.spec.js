import { mergeFrontMatterTrackingCode } from '../lib/frontmatter.js';

describe('mergeFrontMatterTrackingCode', () => {
  it('should do nothing if no front matter is present', () => {
    expect(mergeFrontMatterTrackingCode('area-ID-alias', 'hello world')).toBe(
      'area-ID-alias'
    );
  });

  it('should merge tracking code from front matter property trackingCode', () => {
    expect(
      mergeFrontMatterTrackingCode(
        'area-ID-alias',
        '---\ntrackingCode: party-hard\n---'
      )
    ).toBe('party-hard-alias');
  });

  it('should merge tracking code from front matter property tracking_code', () => {
    expect(
      mergeFrontMatterTrackingCode(
        'area-ID-alias',
        '---\ntracking_code: party-hard\n---'
      )
    ).toBe('party-hard-alias');
  });

  it('should merge tracking code from front matter property tracking-code', () => {
    expect(
      mergeFrontMatterTrackingCode(
        'area-ID-alias',
        '---\ntracking-code: party-hard\n---'
      )
    ).toBe('party-hard-alias');
  });
});
