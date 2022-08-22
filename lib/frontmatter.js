import matter from 'gray-matter';
import { mergeTrackingCode } from './tracking.js';

export function mergeFrontMatterTrackingCode(trackingCode, text) {
  const { data } = matter(text);
  const code = data.trackingCode || data.tracking_code || data['tracking-code'];
  if (code) {
    trackingCode = mergeTrackingCode(trackingCode, code);
  }

  return trackingCode;
}
