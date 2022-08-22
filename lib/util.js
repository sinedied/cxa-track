import process from 'process';
import chalk from 'chalk';

export const containsOnlyAlphanumeric = (string) => /^\w+$/.test(string);

export const isUrl = (string) => /^https?:\/\/\w/.test(string);

export const removeLocaleFromUrl = (url) =>
  url.replace(/microsoft.com\/\w{2}-\w{2}\//g, 'microsoft.com/');

export const addLocaleToUrl = (url, locale) =>
  locale ? url.replace(/microsoft.com\//g, `microsoft.com/${locale}/`) : url;

export const parseQueryParams = (queryString) =>
  Object.fromEntries(new URLSearchParams(queryString).entries());

export function checkLocale(locale) {
  if (!/^\w{2}-\w{2}$/.test(locale)) throw new Error('Invalid locale format');
}

export function safeRun(func) {
  try {
    return func() || true;
  } catch (error) {
    console.error(chalk.yellow`Error: ${error.message}`);
    process.exitCode = -1;
  }
}
