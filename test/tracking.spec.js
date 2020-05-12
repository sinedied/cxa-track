const clipboardy = require('clipboardy');
const {
  isTrackedDomain,
  checkTrackedDomain,
  mergeTrackingCode,
  mergeFrontMatterTrackingCode,
  generateTrackingParams,
  parseTrackingCode,
  updateTrackedUrl,
  updateTrackedUrlAndCopy,
  updateTrackingCodeInText
} = require('../lib/tracking');

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
    expect(() => mergeTrackingCode('event')).toThrow();
  });

  it('should return default', () => {
    expect(mergeTrackingCode('event-channel-alias')).toBe(
      'event-channel-alias'
    );
  });

  it('should override default event', () => {
    expect(mergeTrackingCode('event-channel-alias', 'party')).toBe(
      'party-channel-alias'
    );
  });

  it('should override default event and channel', () => {
    expect(mergeTrackingCode('event-channel-alias', 'party-hard')).toBe(
      'party-hard-alias'
    );
  });

  it('should override default tracking code', () => {
    expect(mergeTrackingCode('event-channel-alias', 'party-hard-bob')).toBe(
      'party-hard-bob'
    );
  });
});

describe('mergeFrontMatterTrackingCode', () => {
  it('should do nothing if no front matter is present', () => {
    expect(
      mergeFrontMatterTrackingCode('event-channel-alias', 'hello world')
    ).toBe('event-channel-alias');
  });

  it('should merge tracking code from front matter property trackingCode', () => {
    expect(
      mergeFrontMatterTrackingCode(
        'event-channel-alias',
        '---\ntrackingCode: party-hard\n---'
      )
    ).toBe('party-hard-alias');
  });

  it('should merge tracking code from front matter property tracking_code', () => {
    expect(
      mergeFrontMatterTrackingCode(
        'event-channel-alias',
        '---\ntracking_code: party-hard\n---'
      )
    ).toBe('party-hard-alias');
  });

  it('should merge tracking code from front matter property tracking-code', () => {
    expect(
      mergeFrontMatterTrackingCode(
        'event-channel-alias',
        '---\ntracking-code: party-hard\n---'
      )
    ).toBe('party-hard-alias');
  });
});

describe('generateTrackingParams', () => {
  it('should return web trends tracking params', () => {
    expect(generateTrackingParams('event-channel-alias')).toBe(
      'WT.mc_id=event-channel-alias'
    );
  });
});

describe('parseTrackingCode', () => {
  it('should throw if string is empty', () => {
    expect(() => parseTrackingCode('')).toThrow();
  });

  it('should throw if there is invalid characters', () => {
    expect(() => parseTrackingCode('a+e')).toThrow();
  });

  it('should parse event', () => {
    expect(parseTrackingCode('event')).toEqual({event: 'event'});
  });

  it('should parse event and channel', () => {
    expect(parseTrackingCode('event-channel')).toEqual({
      event: 'event',
      channel: 'channel'
    });
  });

  it('should parse event, channel and alias', () => {
    expect(parseTrackingCode('event-channel-alias')).toEqual({
      event: 'event',
      channel: 'channel',
      alias: 'alias'
    });
  });

  it('should allow underscore', () => {
    expect(parseTrackingCode('build_event')).toEqual({event: 'build_event'});
  });
});

describe('updateTrackedUrl', () => {
  it('should add tracking params', () => {
    expect(
      updateTrackedUrl('https://azure.microsoft.com/', 'event-channel-alias')
    ).toBe('https://azure.microsoft.com/?WT.mc_id=event-channel-alias');
  });

  it('should add tracking params and keep existing params', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/?debug=true',
        'event-channel-alias'
      )
    ).toBe(
      'https://azure.microsoft.com/?debug=true&WT.mc_id=event-channel-alias'
    );
  });

  it('should add tracking params and keep existing hash', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/#section',
        'event-channel-alias'
      )
    ).toBe('https://azure.microsoft.com/?WT.mc_id=event-channel-alias#section');
  });

  it('should update tracking params', () => {
    expect(
      updateTrackedUrl(
        'https://azure.microsoft.com/?WT.mc_id=party-hard-bob',
        'event-channel-alias'
      )
    ).toBe('https://azure.microsoft.com/?WT.mc_id=event-channel-alias');
  });
});

describe('updateTrackedUrlAndCopy', () => {
  it('should add tracking params and copy to clipboard', () => {
    const url = updateTrackedUrlAndCopy(
      'https://azure.microsoft.com/',
      'event-channel-alias'
    );
    const clipboardUrl = clipboardy.readSync();
    expect(url).toBe(
      'https://azure.microsoft.com/?WT.mc_id=event-channel-alias'
    );
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

    expect(updateTrackingCodeInText(text, 'event-channel-alias'))
      .toBe(`# Testing
    files with random URLs (http://google.com) and some with tracked links [here](https://azure.microsoft.com/demo?WT.mc_id=event-channel-alias#hash).
    It should leave untouched this one: azure.microsoft.com but replace this one: http://code.visualstudio.com/download?WT.mc_id=event-channel-alias.`);
  });
});
