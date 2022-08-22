import clipboardy from 'clipboardy';
import { updateUrlInline } from '../lib/cli.js';

describe('updateUrlInline', () => {
  it('should add tracking code to URL and copy it to clipboard', () => {
    clipboardy.writeSync('');
    const url = updateUrlInline(
      'https://azure.microsoft.com/',
      'area-ID-alias'
    );
    const clipboardUrl = clipboardy.readSync();
    expect(url).toBe('https://azure.microsoft.com/?WT.mc_id=area-ID-alias');
    expect(clipboardUrl).toBe(url);
  });
});
