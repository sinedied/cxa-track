const path = require('path');
const fs = require('fs').promises;
const minimist = require('minimist');
const chalk = require('chalk');
const Conf = require('conf');
const clipboardy = require('clipboardy');
const updateNotifier = require('update-notifier');
const {isUrl, safeRun, checkLocale} = require('./lib/util');
const {
  checkTrackedDomain,
  mergeTrackingCode,
  mergeFrontMatterTrackingCode,
  updateTrackedUrlAndCopy,
  updateTrackingCodeInText
} = require('./lib/tracking');
const pkg = require('./package.json');

const clipboardRefreshIntervalMs = 300;
const appName = path.basename(process.argv[1]);
const help = chalk`{bold Usage:} ${appName} [options] [<files|URL>]

You can omit the URL argument if you copy one in the clipboard.

{bold Options:}
  -s, --set <tracking-code>    Set default tracking code
  -t, --track <tracking-code>  Use specified tracking code
  -w, --watch                  Watch clipboard for URLs
  -k, --keep-locale            Keep locale code in URLs
  -l, --locale <locale>        Force locale code in URLs
  -h, --help                   Show this help

Tracking code format (fallback to default for missing values):
  ID
  area-ID
  area-ID-alias

Locale format: <language>-<country>, example: en-us
`;

function cli(args) {
  updateNotifier({pkg}).notify();

  const options = minimist(args, {
    boolean: ['watch', 'version', 'help', 'keep-locale'],
    string: ['set', 'track', 'locale'],
    alias: {
      w: 'watch',
      s: 'set',
      t: 'track',
      k: 'keep-locale',
      l: 'locale',
      v: 'version',
      h: 'help'
    }
  });

  const config = new Conf({
    projectName: pkg.name,
    defaults: {trackingCode: null}
  });

  if (options.version) {
    return console.log(pkg.version);
  }

  if (options.help) {
    return console.log(help);
  }

  safeRun(() => {
    if (options.set !== undefined) {
      const trackingCode = setDefaultTrackingCode(config, options.set);
      return console.log(
        chalk`Default tracking code set to {green ${trackingCode}}`
      );
    }

    const locale = options.locale || options['keep-locale'];
    const updateOptions = {
      partialTrackingCode: options.track,
      locale
    };

    if (locale && typeof locale === 'string') checkLocale(locale);

    if (options.watch) {
      return watchClipboard(config, updateOptions);
    }

    updateTrackingCode(config, options._, updateOptions);
  });
}

function setDefaultTrackingCode(config, partialTrackingCode) {
  const trackingCode = mergeTrackingCode(
    config.get('trackingCode'),
    partialTrackingCode
  );

  config.set('trackingCode', trackingCode);

  return trackingCode;
}

function updateUrlInline(url, trackingCode, locale) {
  return safeRun(() => {
    checkTrackedDomain(url);
    const newUrl = updateTrackedUrlAndCopy(url, trackingCode, locale);
    console.log(chalk`{green URL copied to clipboard!}\n${newUrl}`);
    return newUrl;
  });
}

async function updateTrackingCodeInFiles(files, trackingCode, locale) {
  let updatedCount = 0;
  await Promise.all(
    files.map(async (file) => {
      try {
        const text = await fs.readFile(file, 'utf-8');
        const textTrackingCode = mergeFrontMatterTrackingCode(
          trackingCode,
          text
        );
        const newText = updateTrackingCodeInText(
          text,
          textTrackingCode,
          locale
        );

        if (newText !== text) {
          await fs.writeFile(file, newText);
          ++updatedCount;
          console.log(
            chalk`Updated ${file} with tracking code {green ${textTrackingCode}}`
          );
        }
      } catch (error) {
        console.error(chalk`{yellow Error: ${error.message}}`);
        process.exitCode = -1;
      }
    })
  );
  console.log(chalk`${updatedCount} file(s) updated`);
}

function updateTrackingCode(config, filesOrUrl, options) {
  const {partialTrackingCode, locale} = options;
  const trackingCode = mergeTrackingCode(
    config.get('trackingCode'),
    partialTrackingCode
  );

  // Fetch URL from clipboard
  if (filesOrUrl.length === 0) {
    const clipboardText = clipboardy.readSync();

    if (!isUrl(clipboardText)) {
      console.log(chalk`{yellow No URL found in clipboard}\n\n${help}`);
    } else if (!updateUrlInline(clipboardText, trackingCode, locale)) {
      console.log(`\n${help}`);
    }

    return;
  }

  // Update single URL
  if (filesOrUrl.length === 1 && isUrl(filesOrUrl)) {
    return updateUrlInline(filesOrUrl[0], trackingCode, locale);
  }

  // Update in files
  return updateTrackingCodeInFiles(filesOrUrl, trackingCode, locale);
}

function watchClipboard(config, options) {
  const {partialTrackingCode, locale} = options;
  const trackingCode = mergeTrackingCode(
    config.get('trackingCode'),
    partialTrackingCode
  );
  let previous = '';

  setInterval(() => {
    let clipboard = clipboardy.readSync();

    if (clipboard !== previous) {
      const clipboardTrackingCode = mergeFrontMatterTrackingCode(
        trackingCode,
        clipboard
      );
      const newClipboard = updateTrackingCodeInText(
        clipboard,
        clipboardTrackingCode,
        locale
      );

      if (newClipboard !== clipboard) {
        clipboard = newClipboard;
        clipboardy.writeSync(clipboard);
        console.log(`Updated with code ${clipboardTrackingCode}`);
      }

      previous = clipboard;
    }
  }, clipboardRefreshIntervalMs);

  console.log(
    chalk`Using tracking code {green ${trackingCode}}\n` +
      `Watching clipboard for URLs to update...\n` +
      `Press CRTL+C to exit`
  );
}

module.exports = {
  cli,
  setDefaultTrackingCode,
  updateTrackingCode,
  watchClipboard,
  updateUrlInline,
  updateTrackingCodeInFiles
};
