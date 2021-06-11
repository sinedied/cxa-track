const chalk = require('chalk');

const containsOnlyAlphanumeric = (string) => /^\w+$/.test(string);

const isUrl = (string) => /^https?:\/\/\w/.test(string);

const removeLocaleFromUrl = (url) =>
  url.replace(/microsoft.com\/\w{2}-\w{2}\//g, 'microsoft.com/');

const addLocaleToUrl = (url, locale) =>
  locale ? url.replace(/microsoft.com\//g, `microsoft.com/${locale}/`) : url;

function checkLocale(locale) {
  if (!/^\w{2}-\w{2}$/.test(locale)) throw new Error('Invalid locale format');
}

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
  removeLocaleFromUrl,
  addLocaleToUrl,
  checkLocale,
  splitHashFromUrl,
  safeRun
};
