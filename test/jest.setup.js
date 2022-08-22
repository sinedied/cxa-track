import { jest } from '@jest/globals';

jest.unstable_mockModule('clipboardy', () => {
  let clipboard = null;
  return {
    __esModule: true,
    default: {
      readSync: () => clipboard,
      writeSync(data) {
        clipboard = data;
      }
    }
  };
});
