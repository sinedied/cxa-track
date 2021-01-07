const chalk = require('chalk');

const containsOnlyAlphanumeric = (string) => /^\w+$/.test(string);

const isUrl = (string) => /^https?:\/\/\w/.test(string);

const removeLanguageFromUrl = (url) =>
  url.replace(/microsoft.com\/\w{2}-\w{2}\//g, 'microsoft.com/');

function splitHashFromUrl(url) {
  const hashIndex = url.indexOf('#');
  return hashIndex === -1
    ? [url, '']
    : [url.slice(0, hashIndex), url.slice(hashIndex)];
}

function safeRun(func) {
  try {
    return func() || true;
  } catch (error) {
    console.error(chalk`{yellow Error: ${error.message}}`);
    process.exitCode = -1;
  }
}

module.exports = {
  containsOnlyAlphanumeric,
  isUrl,
  removeLanguageFromUrl,
  splitHashFromUrl,
  safeRun
};
