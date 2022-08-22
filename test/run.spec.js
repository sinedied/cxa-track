import { safeRun } from '../lib/run.js';

describe('safeRun', () => {
  it('should swallow exception', () => {
    expect(() =>
      safeRun(() => {
        throw new Error('oups');
      })
    ).not.toThrow();
  });
});
