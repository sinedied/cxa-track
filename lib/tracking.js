import {
  containsOnlyAlphanumeric,
  removeLocaleFromUrl,
  addLocaleToUrl
} from './util.js';

export const trackedDomains = [
  'portal.azure.com',
  'microsoft.com',
  'msdn.com',
  'visualstudio.com',
  'microsoftazurepass.com',
  'microsoftevents.com'
];

const trackingParam = 'WT.mc_id';
const urlRegex = /\bhttps?:\/\/[-\w+&@#/%?=~|!:,.;]*[-\w+&@#/%=~|]/gim;

export function isTrackedDomain(url) {
  const { hostname } = new URL(url);
  return trackedDomains.some((domain) => hostname.includes(domain));
}

export function checkTrackedDomain(url) {
  if (!isTrackedDomain(url)) throw new Error('URL domain is not tracked');
}

export function mergeTrackingCode(baseTrackingCode, otherTrackingCode) {
  const base = baseTrackingCode ? parseTrackingCode(baseTrackingCode) : {};
  const other = otherTrackingCode ? parseTrackingCode(otherTrackingCode) : {};

  const area = other.area || base.area;
  const id = other.id || base.id;
  const alias = other.alias || base.alias;

  if (!area || !id || !alias) throw new Error('tracking code incomplete');

  return `${area}-${id}-${alias}`;
}

export function generateTrackingParameters(trackingCode, params = {}) {
  return new URLSearchParams({
    ...params,
    [trackingParam]: trackingCode
  }).toString();
}

export function parseTrackingCode(partialTrackingCode) {
  if (!partialTrackingCode) throw new Error('no tracking code defined');

  let [area, id, alias] = partialTrackingCode.split('-');

  // If only a single value is set, it's the ID
  if (area !== undefined && id === undefined) {
    id = area;
    area = undefined;
  }

  if (
    !containsOnlyAlphanumeric(id) ||
    (area !== undefined && !containsOnlyAlphanumeric(area)) ||
    (alias !== undefined && !containsOnlyAlphanumeric(alias))
  )
    throw new Error('tracking code can only contain alphanumeric characters');

  return { area, id, alias };
}

export function updateTrackedUrl(url, trackingCode, locale, extraParams = {}) {
  if (locale !== true) url = removeLocaleFromUrl(url);

  if (typeof locale === 'string') url = addLocaleToUrl(url, locale);

  const currentUrl = new URL(url);
  const existingParams = Object.fromEntries(currentUrl.searchParams.entries());
  const newTrackingParameters = generateTrackingParameters(trackingCode, {
    ...existingParams,
    ...extraParams
  });
  currentUrl.search = newTrackingParameters;
  return currentUrl.href;
}

export function updateTrackingCodeInText(
  text,
  trackingCode,
  locale,
  extraParams
) {
  return text
    ? text.replaceAll(urlRegex, (url) =>
        isTrackedDomain(url)
          ? updateTrackedUrl(url, trackingCode, locale, extraParams)
          : url
      )
    : text;
}
