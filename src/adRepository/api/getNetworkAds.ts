import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { pushToCache } from '~/cache/api';
import { LinkedObject } from '~/utils/linkedObject';

const convertToInternalAd = (ad: Amity.RawAd): Amity.InternalAd => {
  return {
    ...ad,
    endAt: ad.endAt ? ad.endAt : null,
  };
};

const convertToInternalAdvertiser = (advertiser: Amity.RawAdvertiser): Amity.InternalAdvertiser => {
  return {
    ...advertiser,
  };
};

export const getNetworkAds = async (): Promise<Amity.NetworkAds> => {
  const client = getActiveClient();

  const { data } = await client.http.get<Amity.AdPayload>('/api/v1/ads/me');

  const internalAds = data.ads.map(convertToInternalAd);
  const internalAdvertisers = data.advertisers.map(convertToInternalAdvertiser);

  ingestInCache({
    ads: internalAds,
    advertisers: internalAdvertisers,
    files: data.files,
  });
  pushToCache(['ad', 'setting'], data.settings);

  return {
    ads: internalAds.map(LinkedObject.ad),
    settings: data.settings,
  };
};
