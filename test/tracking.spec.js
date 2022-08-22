import clipboardy from 'clipboardy';
import {
  isTrackedDomain,
  checkTrackedDomain,
  mergeTrackingCode,
  mergeFrontMatterTrackingCode,
  generateTrackingParameters,
  parseTrackingCode,
  updateTrackedUrl,
  updateTrackedUrlAndCopy,
  updateTrackingCodeInText
} from '../lib/tracking.js';

describe('isTrackedDomain', () => {
  it('should return true', () => {
    expect(
      isTrackedDomain('https://azure.microsoft.com/fr-fr/free/students/')
    ).toBe(true);
  });

  it('should return fase', () => {
    expect(isTrackedDomain('https://google.com/')).toBe(false);
  });
});

describe('checkTrackedDomain', () => {
  it('should not throw', () => {
    expect(() =>
      checkTrackedDomain('https://azure.microsoft.com/fr-fr/free/students/')
    ).not.toThrow();
  });

  it('should throw', () => {
    expect(() => checkTrackedDomain('https://google.com/')).toThrow();
  });
});

describe('mergeTrackingCode', () => {
  it('should throw', () => {
    expect(() => mergeTrackingCode('area')).toThrow();
  });

  it('should return default', () => {
    expect(mergeTrackingCode('area-ID-alias')).toBe('area-ID-alias');
  });

  it('should override default ID', () => {
    expect(mergeTrackingCode('area-ID-alias', 'party')).toBe(
      'area-party-alias'
    );
  });

  it('should override default area and ID', () => {
    expect(mergeTrackingCode('area-ID-alias', 'party-hard')).toBe(
      'party-hard-alias'
    );
  });

  it('should override default tracking code', () => {
    expect(mergeTrackingCode('area-ID-alias', 'party-hard-bob')).toBe(
      'party-hard-bob'
    );
  });
});

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

describe('generateTrackingParameters', () => {
  it('should return web trends tracking params', () => {
    expect(generateTrackingParameters('area-ID-alias')).toBe(
      'WT.mc_id=area-ID-alias'
    );
  });

  it('should return web trends tracking params merged with existing params', () => {
    expect(generateTrackingParameters('area-ID-alias', { data: 'test' })).toBe(
      'data=test&WT.mc_id=area-ID-alias'
    );
  });

  it('should return updated web trends tracking params', () => {
    expect(
      generateTrackingParameters('area-ID-alias', { 'WT.mc_id': 'hello' })
    ).toBe('WT.mc_id=area-ID-alias');
  });
});

describe('parseTrackingCode', () => {
  it('should throw if string is empty', () => {
    expect(() => parseTrackingCode('')).toThrow();
  });

  it('should throw if there is invalid characters', () => {
    expect(() => parseTrackingCode('a+e')).toThrow();
  });

  it('should parse ID', () => {
    expect(parseTrackingCode('ID')).toEqual({ id: 'ID' });
  });

  it('should parse area and ID', () => {
    expect(parseTrackingCode('area-ID')).toEqual({
      area: 'area',
      id: 'ID'
    });
  });

  it('should parse area, ID and alias', () => {
    expect(parseTrackingCode('area-ID-alias')).toEqual({
      area: 'area',
      id: 'ID',
      alias: 'alias'
    });
  });

  it('should allow underscore', () => {
    expect(parseTrackingCode('build_area')).toEqual({ id: 'build_area' });
  });
});

describe('updateTrackedUrl', () => {
  it('should add tracking params', () => {
    expect(
      updateTrackedUrl('https://azure.microsoft.com/', 'area-ID-alias')
    ).toBe('https://azure.microsoft.com/?WT.mc_id=area-ID-alias');
  });

  it('should add tracking params and keep existing params', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/?debug=true',
        'area-ID-alias'
      )
    ).toBe('https://azure.microsoft.com/?debug=true&WT.mc_id=area-ID-alias');
  });

  it('should add tracking params and keep existing hash', () => {
    expect(
      updateTrackedUrl('https://azure.microsoft.com/#section', 'area-ID-alias')
    ).toBe('https://azure.microsoft.com/?WT.mc_id=area-ID-alias#section');
  });

  it('should update tracking params', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/?WT.mc_id=party-hard-bob',
        'area-ID-alias'
      )
    ).toBe('https://azure.microsoft.com/?WT.mc_id=area-ID-alias');
  });

  it('should remove locale part from URL', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/fr-fr/docs/',
        'area-ID-alias'
      )
    ).toBe('https://azure.microsoft.com/docs/?WT.mc_id=area-ID-alias');
  });

  it('should keep locale part in URL', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/fr-fr/docs/',
        'area-ID-alias',
        true
      )
    ).toBe('https://azure.microsoft.com/fr-fr/docs/?WT.mc_id=area-ID-alias');
  });

  it('should replace locale part in URL', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/fr-fr/docs/',
        'area-ID-alias',
        'de-de'
      )
    ).toBe('https://azure.microsoft.com/de-de/docs/?WT.mc_id=area-ID-alias');
  });

  it('should add locale part in URL', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/docs/',
        'area-ID-alias',
        'fr-fr'
      )
    ).toBe('https://azure.microsoft.com/fr-fr/docs/?WT.mc_id=area-ID-alias');
  });

  it('should add tracking params and extra params', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/?debug=true',
        'area-ID-alias',
        true,
        { extra: 'test' }
      )
    ).toBe(
      'https://azure.microsoft.com/?debug=true&extra=test&WT.mc_id=area-ID-alias'
    );
  });
});

describe('updateTrackedUrlAndCopy', () => {
  it('should add tracking params and copy to clipboard', () => {
    const url = updateTrackedUrlAndCopy(
      'https://azure.microsoft.com/',
      'area-ID-alias'
    );
    const clipboardUrl = clipboardy.readSync();
    expect(url).toBe('https://azure.microsoft.com/?WT.mc_id=area-ID-alias');
    expect(clipboardUrl).toBe(url);
  });
});

describe('updateTrackingCodeInText', () => {
  it('should do nothing', () => {
    expect(updateTrackingCodeInText()).toBe(undefined);
    expect(updateTrackingCodeInText('hello')).toBe('hello');
  });

  it('should replace only tracked URLs', () => {
    const text = `# Testing
    files with random URLs (http://google.com) and some with tracked links [here](https://azure.microsoft.com/fr-fr/demo#hash).
    It should leave untouched this one: azure.microsoft.com but replace this one: http://code.visualstudio.com/download.`;

    expect(updateTrackingCodeInText(text, 'area-ID-alias')).toBe(`# Testing
    files with random URLs (http://google.com) and some with tracked links [here](https://azure.microsoft.com/demo?WT.mc_id=area-ID-alias#hash).
    It should leave untouched this one: azure.microsoft.com but replace this one: http://code.visualstudio.com/download?WT.mc_id=area-ID-alias.`);
  });
});
