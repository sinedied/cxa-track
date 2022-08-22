const nativeModule = require('module');

function resolver(module, options) {
  const { basedir, defaultResolver } = options;
  try {
    return defaultResolver(module, options);
  } catch {
    // Needed to load chalk package imports
    // see https://github.com/facebook/jest/issues/12270
    return nativeModule.createRequire(basedir).resolve(module);
  }
}

module.exports = resolver;
