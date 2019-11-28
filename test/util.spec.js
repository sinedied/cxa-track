const {
  containsOnlyAlphanumeric,
  isUrl,
  removeLanguageFromUrl,
  splitHashFromUrl,
  safeRun
} = require('../lib/util');

describe('containsOnlyAlphanumeric', () => {
  it('should return true', () => {
    expect(containsOnlyAlphanumeric('AUdfh1s45fkn')).toBe(true);
  });

  it('should return fase', () => {
    expect(containsOnlyAlphanumeric('_sdf')).toBe(false);
  });
});

describe('isUrl', () => {
  it('should return true', () => {
    expect(isUrl('https://hello.com')).toBe(true);
  });

  it('should return fase', () => {
    expect(isUrl('some random text')).toBe(false);
  });
});

describe('removeLanguageFromUrl', () => {
  it('should remove language part from URL', () => {
    expect(removeLanguageFromUrl('https://microsoft.com/fr-fr/azure')).toBe(
      'https://microsoft.com/azure'
    );
  });

  it('should keep URL intact', () => {
    expect(
      removeLanguageFromUrl('https://microsoft.com/hello-world/azure')
    ).toBe('https://microsoft.com/hello-world/azure');
  });
});

describe('splitHashFromUrl', () => {
  it('should work without hash', () => {
    expect(splitHashFromUrl('https://hello.com')).toStrictEqual([
      'https://hello.com',
      ''
    ]);
  });

  it('should split base URL and hash', () => {
    expect(splitHashFromUrl('https://hello.com#hash')).toStrictEqual([
      'https://hello.com',
      '#hash'
    ]);
  });
});

describe('safeRun', () => {
  it('should swallow exception', () => {
    expect(() =>
      safeRun(() => {
        throw new Error('oups');
      })
    ).not.toThrow();
  });
});
