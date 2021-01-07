const clipboardy = require('clipboardy');
const matter = require('gray-matter');
const {
  containsOnlyAlphanumeric,
  removeLanguageFromUrl,
  splitHashFromUrl
} = require('./util');

const trackedDomains = [
  'aka.ms',
  'azure.com',
  'azure.microsoft.com',
  'blogs.msdn.microsoft.com',
  'channel9.msdn.com',
  'code.visualstudio.com',
  'cloudblogs.microsoft.com',
  'devblogs.microsoft.com ',
  'docs.microsoft.com',
  'marketplace.visualstudio.com',
  'techcommunity.microsoft.com'
];
const trackingParametersRegex = /wt\.mc_id=\w+-\w+-\w+/gi;
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

  const event = other.event || base.event;
  const channel = other.channel || base.channel;
  const alias = other.alias || base.alias;

  if (!event || !channel || !alias) throw new Error('tracking code incomplete');

  return `${event}-${channel}-${alias}`;
}

function mergeFrontMatterTrackingCode(trackingCode, text) {
  const {data} = matter(text);
  const code = data.trackingCode || data.tracking_code || data['tracking-code'];
  if (code) {
    trackingCode = mergeTrackingCode(trackingCode, code);
  }

  return trackingCode;
}

const generateTrackingParameters = (trackingCode) => `WT.mc_id=${trackingCode}`;

function parseTrackingCode(partialTrackingCode) {
  if (!partialTrackingCode) throw new Error('no tracking code defined');

  const [event, channel, alias] = partialTrackingCode.split('-');
  if (
    !containsOnlyAlphanumeric(event) ||
    (channel !== undefined && !containsOnlyAlphanumeric(channel)) ||
    (alias !== undefined && !containsOnlyAlphanumeric(alias))
  )
    throw new Error('tracking code can only contain alphanumeric characters');

  return {event, channel, alias};
}

function updateTrackedUrl(url, trackingCode) {
  url = removeLanguageFromUrl(url);

  const newTrackingParameters = generateTrackingParameters(trackingCode);

  if (trackingParametersRegex.test(url)) {
    // Update tracking params
    return url.replace(trackingParametersRegex, newTrackingParameters);
  }

  // Add tracking params
  const separator = url.indexOf('?') > 0 ? '&' : '?';
  const [baseUrl, hash] = splitHashFromUrl(url);
  return baseUrl + separator + newTrackingParameters + hash;
}

function updateTrackedUrlAndCopy(url, trackingCode) {
  const newUrl = updateTrackedUrl(url, trackingCode);
  clipboardy.writeSync(newUrl);
  return newUrl;
}

function updateTrackingCodeInText(text, trackingCode) {
  return text
    ? text.replace(urlRegex, (url) =>
        isTrackedDomain(url) ? updateTrackedUrl(url, trackingCode) : url
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
