import clipboardy from 'clipboardy';
import { updateTrackedUrl } from './tracking.js';

export function updateTrackedUrlAndCopy(
  url,
  trackingCode,
  locale,
  extraParams
) {
  const newUrl = updateTrackedUrl(url, trackingCode, locale, extraParams);
  clipboardy.writeSync(newUrl);
  return newUrl;
}
