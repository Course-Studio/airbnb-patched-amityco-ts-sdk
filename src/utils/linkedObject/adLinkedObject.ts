import { pullFromCache } from '~/cache/api';
import AnalyticsEngine from '~/analytic/service/analytic/AnalyticsEngine';

export const adLinkedObject = (ad: Amity.InternalAd): Amity.Ad => {
  const analyticsEngineInstance = AnalyticsEngine.getInstance();
  const { image9_16: image916, image1_1: image11, ...restAds } = ad;
  return {
    ...restAds,
    analytics: {
      markAsSeen: (placement: Amity.AdPlacement) => {
        analyticsEngineInstance.markAdAsViewed(ad, placement);
      },
      markLinkAsClicked: (placement: Amity.AdPlacement) => {
        analyticsEngineInstance.markAdAsClicked(ad, placement);
      },
    },
    get advertiser(): Amity.Advertiser | undefined {
      const advertiserData = pullFromCache<Amity.RawAdvertiser>([
        'advertiser',
        'get',
        ad.advertiserId,
      ])?.data;

      if (!advertiserData) return;

      const avatarFile = pullFromCache<Amity.File<'image'>>([
        'file',
        'get',
        advertiserData.avatarFileId,
      ])?.data;

      return {
        ...advertiserData,
        avatar: avatarFile,
      };
    },

    get image1_1(): Amity.File<'image'> | undefined {
      const cacheData = pullFromCache<Amity.File<'image'>>(['file', 'get', image11]);
      if (!cacheData) return undefined;
      return cacheData.data || undefined;
    },

    get image9_16(): Amity.File<'image'> | undefined {
      const cacheData = pullFromCache<Amity.File<'image'>>(['file', 'get', image916]);
      if (!cacheData) return undefined;
      return cacheData.data || undefined;
    },
  };
};
