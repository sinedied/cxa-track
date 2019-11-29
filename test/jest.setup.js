jest.mock('clipboardy', () => {
  let clipboard = null;
  return {
    readSync: () => clipboard,
    writeSync: data => {
      clipboard = data;
    }
  };
});
