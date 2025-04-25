export {};

declare global {
  namespace Amity {
    const enum AdPlacement {
      FEED = 'feed',
      STORY = 'story',
      COMMENT = 'comment',
      CHATLIST = 'chatlist',
      CHAT = 'chat',
    }

    const enum SettingDisplayType {
      Fixed = 'fixed',
      TimeWindow = 'time-window',
    }

    type AdTarget = {
      communityIds: Amity.Community['communityId'][];
    };

    type RawAd = {
      adId: string;
      advertiserId: string;
      name: string;
      placements: AdPlacement[];
      headline: string;
      description: string;
      body: string;
      image1_1: string;
      image9_16: string;
      callToAction: string;
      callToActionUrl: string;
      target: Amity.AdTarget;
      startAt: Amity.timestamp;
      endAt?: Amity.timestamp;
      createdAt: Amity.timestamp;
      updatedAt: Amity.timestamp;
    };

    type RawAdvertiser = {
      advertiserId: string;
      name: string;
      companyName: string;
      avatarFileId: string;
      adsCount: number;
      createdAt: Amity.timestamp;
      updatedAt: Amity.timestamp;
    };

    type AdFrequency = {
      type: Amity.SettingDisplayType;
      value: number;
    };

    type FrequencySettings = {
      feed?: Amity.AdFrequency;
      story?: Amity.AdFrequency;
      comment?: Amity.AdFrequency;
    };

    type AdsSettings = {
      enabled: boolean;
      maxActiveAds: number;
      frequency: Amity.FrequencySettings;
      updatedAt: Amity.timestamp;
    };

    type InternalAdvertiser = RawAdvertiser;

    type Advertiser = RawAdvertiser & {
      avatar?: Amity.File<'image'>;
    };

    type InternalAd = Omit<RawAd, 'endAt'> & {
      endAt: Amity.timestamp | null;
    };

    type Ad = Omit<InternalAd, 'image1_1' | 'image9_16'> & {
      advertiser?: Amity.Advertiser;
      image1_1?: Amity.File<'image'>;
      image9_16?: Amity.File<'image'>;
      analytics: {
        markAsSeen: (placement: Amity.AdPlacement) => void;
        markLinkAsClicked: (placement: Amity.AdPlacement) => void;
      };
    };

    type InternalNetworkAds = {
      ads: Amity.InternalAd[];
      settings: Amity.AdsSettings;
    };

    type NetworkAds = {
      ads: Amity.Ad[];
      settings: Amity.AdsSettings;
    };
  }
}
