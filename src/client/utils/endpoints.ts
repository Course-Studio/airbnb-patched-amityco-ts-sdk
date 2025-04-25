export const API_REGIONS = {
  EU: 'eu',
  SG: 'sg',
  US: 'us',
} as const;

const URLS = {
  http: 'https://apix.{region}.amity.co',
  upload: 'https://upload.{region}.amity.co',
  mqtt: 'wss://sse.{region}.amity.co:443/mqtt',
} as const;

export function computeUrl(type: keyof typeof URLS, region: string) {
  return URLS[type].replace('{region}', region);
}
