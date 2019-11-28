const clipboardy = require('clipboardy');
const {updateUrlInline} = require('../cli');

describe('updateUrlInline', () => {
  it('should add tracking code to URL and copy it to clipboard', () => {
    clipboardy.writeSync('');
    const url = updateUrlInline(
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
