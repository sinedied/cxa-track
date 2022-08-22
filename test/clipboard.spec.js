import clipboardy from 'clipboardy';
import { updateTrackedUrlAndCopy } from '../lib/clipboard.js';

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
