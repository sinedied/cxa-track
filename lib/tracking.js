const clipboardy = require('clipboardy');
const matter = require('gray-matter');
const {
  containsOnlyAlphanumeric,
  removeLocaleFromUrl,
  addLocaleToUrl
} = require('./util');

const trackedDomains = [
  'azure.com',
  'azure.microsoft.com',
  'blogs.msdn.microsoft.com',
  'channel9.msdn.com',
  'code.visualstudio.com',
  'cloudblogs.microsoft.com',
  'devblogs.microsoft.com',
  'docs.microsoft.com',
  'marketplace.visualstudio.com',
  'techcommunity.microsoft.com',
  'microsoftazurepass.com',
  'account.microsoft.com'
];

const trackingParam = 'WT.mc_id';
const urlRegex = /\bhttps?:\/\/[-\w+&@#/%?=~|!:,.;]*[-\w+&@#/%=~|]/gim;

function isTrackedDomain(url) {
  const {hostname} = new URL(url);
  return trackedDomains.some((domain) => hostname.includes(domain));
}

function checkTrackedDomain(url) {
  if (!isTrackedDomain(url)) throw new Error('URL domain is not tracked');
}

function mergeTrackingCode(baseTrackingCode, otherTrackingCode) {
  const base = baseTrackingCode ? parseTrackingCode(baseTrackingCode) : {};
  const other = otherTrackingCode ? parseTrackingCode(otherTrackingCode) : {};

  const area = other.area || base.area;
  const id = other.id || base.id;
  const alias = other.alias || base.alias;

  if (!area || !id || !alias) throw new Error('tracking code incomplete');

  return `${area}-${id}-${alias}`;
}

function mergeFrontMatterTrackingCode(trackingCode, text) {
  const {data} = matter(text);
  const code = data.trackingCode || data.tracking_code || data['tracking-code'];
  if (code) {
    trackingCode = mergeTrackingCode(trackingCode, code);
  }

  return trackingCode;
}

function generateTrackingParameters(trackingCode, params = {}) {
  return new URLSearchParams({
    ...params,
    [trackingParam]: trackingCode
  }).toString();
}

function parseTrackingCode(partialTrackingCode) {
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

  return {area, id, alias};
}

function updateTrackedUrl(url, trackingCode, locale, extraParams = {}) {
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

function updateTrackedUrlAndCopy(url, trackingCode, locale, extraParams) {
  const newUrl = updateTrackedUrl(url, trackingCode, locale, extraParams);
  clipboardy.writeSync(newUrl);
  return newUrl;
}

function updateTrackingCodeInText(text, trackingCode, locale, extraParams) {
  return text
    ? text.replace(urlRegex, (url) =>
        isTrackedDomain(url)
          ? updateTrackedUrl(url, trackingCode, locale, extraParams)
          : url
      )
    : text;
}

module.exports = {
  trackedDomains,
  isTrackedDomain,
  checkTrackedDomain,
  mergeTrackingCode,
  mergeFrontMatterTrackingCode,
  generateTrackingParameters,
  parseTrackingCode,
  updateTrackedUrl,
  updateTrackedUrlAndCopy,
  updateTrackingCodeInText
};
