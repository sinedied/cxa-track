import process from 'process';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import chalk from 'chalk';
import Conf from 'conf';
import clipboardy from 'clipboardy';
import updateNotifier from 'update-notifier';
import { isUrl, safeRun, checkLocale, parseQueryParams } from './util.js';
import {
  checkTrackedDomain,
  mergeTrackingCode,
  mergeFrontMatterTrackingCode,
  updateTrackedUrlAndCopy,
  updateTrackingCodeInText
} from './tracking.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clipboardRefreshIntervalMs = 300;
const appName = path.basename(process.argv[1]);
const help = `${chalk.bold('Usage:')} ${appName} [options] [<files|URL>]

You can omit the URL argument if you copy one in the clipboard.

${chalk.bold('Options:')}
  -s, --set <tracking-code>    Set default tracking code
  -t, --track <tracking-code>  Use specified tracking code
  -w, --watch                  Watch clipboard for URLs
  -k, --keep-locale            Keep locale code in URLs
  -l, --locale <locale>        Force locale code in URLs
  -e, --extra                  Extra query params to update
  -h, --help                   Show this help

Tracking code format (fallback to default for missing values):
  ID
  area-ID
  area-ID-alias

Locale format: <language>-<country>, example: en-us
Extra format: <param1>=<value1>&<param2>=<value2>, example: foo=bar&baz=qux
`;

export async function cli(args) {
  const pkg = JSON.parse(
    await fs.readFile(path.join(__dirname, '../package.json'), 'utf8')
  );
  updateNotifier({ pkg }).notify();

  const options = minimist(args, {
    boolean: ['watch', 'version', 'help', 'keep-locale'],
    string: ['set', 'track', 'locale', 'extra'],
    alias: {
      w: 'watch',
      s: 'set',
      t: 'track',
      k: 'keep-locale',
      l: 'locale',
      e: 'extra',
      v: 'version',
      h: 'help'
    }
  });

  const config = new Conf({
    projectName: pkg.name,
    defaults: { trackingCode: null }
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
        `Default tracking code set to ${chalk.green(trackingCode)}`
      );
    }

    const locale = options.locale || options['keep-locale'];
    const updateOptions = {
      partialTrackingCode: options.track,
      extraParams: options.extra ? parseQueryParams(options.extra) : undefined,
      locale
    };

    if (locale && typeof locale === 'string') checkLocale(locale);

    if (options.watch) {
      return watchClipboard(config, updateOptions);
    }

    updateTrackingCode(config, options._, updateOptions);
  });
}

export function setDefaultTrackingCode(config, partialTrackingCode) {
  const trackingCode = mergeTrackingCode(
    config.get('trackingCode'),
    partialTrackingCode
  );

  config.set('trackingCode', trackingCode);

  return trackingCode;
}

export function updateUrlInline(url, trackingCode, locale, extraParams) {
  return safeRun(() => {
    checkTrackedDomain(url);
    const newUrl = updateTrackedUrlAndCopy(
      url,
      trackingCode,
      locale,
      extraParams
    );
    console.log(`${chalk.green('URL copied to clipboard!')}\n${newUrl}`);
    return newUrl;
  });
}

export async function updateTrackingCodeInFiles(
  files,
  trackingCode,
  locale,
  extraParams
) {
  let updatedCount = 0;
  await Promise.all(
    files.map(async (file) => {
      try {
        const text = await fs.readFile(file, 'utf8');
        const textTrackingCode = mergeFrontMatterTrackingCode(
          trackingCode,
          text
        );
        const newText = updateTrackingCodeInText(
          text,
          textTrackingCode,
          locale,
          extraParams
        );

        if (newText !== text) {
          await fs.writeFile(file, newText);
          ++updatedCount;
          console.log(
            `Updated ${file} with tracking code ${chalk.green(
              textTrackingCode
            )}`
          );
        }
      } catch (error) {
        console.error(chalk.yellow(`yellow Error: ${error.message}`));
        process.exitCode = -1;
      }
    })
  );
  console.log(`${updatedCount} file(s) updated`);
}

export function updateTrackingCode(config, filesOrUrl, options) {
  const { partialTrackingCode, locale, extraParams } = options;
  const trackingCode = mergeTrackingCode(
    config.get('trackingCode'),
    partialTrackingCode
  );

  // Fetch URL from clipboard
  if (filesOrUrl.length === 0) {
    const clipboardText = clipboardy.readSync();

    if (!isUrl(clipboardText)) {
      console.log(`${chalk.yellow('No URL found in clipboard')}\n\n${help}`);
    } else if (
      !updateUrlInline(clipboardText, trackingCode, locale, extraParams)
    ) {
      console.log(`\n${help}`);
    }

    return;
  }

  // Update single URL
  if (filesOrUrl.length === 1 && isUrl(filesOrUrl)) {
    return updateUrlInline(filesOrUrl[0], trackingCode, locale, extraParams);
  }

  // Update in files
  return updateTrackingCodeInFiles(
    filesOrUrl,
    trackingCode,
    locale,
    extraParams
  );
}

export function watchClipboard(config, options) {
  const { partialTrackingCode, locale, extraParams } = options;
  const trackingCode = mergeTrackingCode(
    config.get('trackingCode'),
    partialTrackingCode
  );
  let previous = '';

  setInterval(() => {
    let clipboard = clipboardy.readSync();

    if (clipboard !== previous) {
      try {
        const clipboardTrackingCode = mergeFrontMatterTrackingCode(
          trackingCode,
          clipboard
        );
        const newClipboard = updateTrackingCodeInText(
          clipboard,
          clipboardTrackingCode,
          locale,
          extraParams
        );

        if (newClipboard !== clipboard) {
          clipboard = newClipboard;
          clipboardy.writeSync(clipboard);
          console.log(`Updated with code ${clipboardTrackingCode}`);
        }

        previous = clipboard;
      } catch (error) {
        console.error(chalk.yellow(`Error: ${error.message}`));
      }
    }
  }, clipboardRefreshIntervalMs);

  console.log(
    `Using tracking code ${chalk.green(trackingCode)}\n` +
      `Watching clipboard for URLs to update...\n` +
      `Press CRTL+C to exit`
  );
}
