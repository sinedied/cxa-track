const {
  containsOnlyAlphanumeric,
  isUrl,
  removeLocaleFromUrl,
  addLocaleToUrl,
  checkLocale,
  safeRun
} = require('../lib/util');

describe('containsOnlyAlphanumeric', () => {
  it('should return true', () => {
    expect(containsOnlyAlphanumeric('AUdfh1s45fkn')).toBe(true);
  });

  it('should return fase', () => {
    expect(containsOnlyAlphanumeric('-sdf')).toBe(false);
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

describe('removeLocaleFromUrl', () => {
  it('should remove locale part from URL', () => {
    expect(removeLocaleFromUrl('https://microsoft.com/fr-fr/azure')).toBe(
      'https://microsoft.com/azure'
    );
  });

  it('should keep URL intact', () => {
    expect(removeLocaleFromUrl('https://microsoft.com/hello-world/azure')).toBe(
      'https://microsoft.com/hello-world/azure'
    );
  });
});

describe('addLocaleToUrl', () => {
  it('should add locale part to URL', () => {
    expect(addLocaleToUrl('https://microsoft.com/azure', 'fr-fr')).toBe(
      'https://microsoft.com/fr-fr/azure'
    );
  });

  it('should keep URL intact', () => {
    expect(addLocaleToUrl('https://microsoft.com/hello-world/azure')).toBe(
      'https://microsoft.com/hello-world/azure'
    );
  });
});

describe('checkLocale', () => {
  it('should not throw', () => {
    expect(() => checkLocale('fr-fr')).not.toThrow();
  });

  it('should throw', () => {
    expect(() => checkLocale('fr')).toThrow();
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
