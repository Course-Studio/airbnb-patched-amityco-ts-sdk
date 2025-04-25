import { pullFromCache } from '~/cache/api';
import AnalyticsEngine from '~/analytic/service/analytic/AnalyticsEngine';
import { userLinkedObject } from '~/utils/linkedObject/userLinkedObject';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { storyTargetLinkedObject } from '~/utils/linkedObject/storyTargetLinkedObject';

export const storyLinkedObject = (story: Amity.InternalStory): Amity.Story => {
  const analyticsEngineInstance = AnalyticsEngine.getInstance();

  const storyTargetCache = pullFromCache<Amity.RawStoryTarget>([
    STORY_KEY_CACHE.STORY_TARGET,
    'get',
    story.targetId,
  ]);

  const communityCacheData = pullFromCache<Amity.Community>(['community', 'get', story.targetId]);

  return {
    ...story,
    analytics: {
      markAsSeen: () => {
        if (!story.expiresAt) return;
        if (story.syncState !== Amity.SyncState.Synced) return;

        analyticsEngineInstance.markStoryAsViewed(story);
      },
      markLinkAsClicked: () => {
        if (!story.expiresAt) return;
        if (story.syncState !== Amity.SyncState.Synced) return;
        analyticsEngineInstance.markStoryAsClicked(story);
      },
    },

    get videoData(): Amity.File<'video'> | undefined {
      const cache = pullFromCache<Amity.File<'video'>>([
        'file',
        'get',
        story.data?.videoFileId?.original,
      ]);

      if (!cache) return undefined;

      const { data } = cache;
      return data || undefined;
    },

    get imageData(): Amity.File<'image'> | undefined {
      if (!story.data?.fileId) return undefined;

      const cache = pullFromCache<Amity.File<'image'>>(['file', 'get', story.data?.fileId]);

      if (!cache) return undefined;

      const { data } = cache;

      if (!data) return undefined;

      return {
        ...data,
        fileUrl: `${data.fileUrl}?size=full`,
      };
    },

    get community(): Amity.Community | undefined {
      if (story.targetType !== 'community') return undefined;
      if (!communityCacheData) return undefined;
      return communityCacheData?.data || undefined;
    },

    get communityCategories(): Amity.Category[] | undefined {
      if (story.targetType !== 'community') return undefined;
      if (!communityCacheData) return undefined;

      const {
        data: { categoryIds },
      } = communityCacheData;

      if (categoryIds.length === 0) return undefined;

      return categoryIds
        .map(categoryId => {
          const categoryCacheData = pullFromCache<Amity.Category>(['category', 'get', categoryId]);
          return categoryCacheData?.data || undefined;
        })
        .filter(category => category !== undefined) as Amity.Category[];
    },

    get creator(): Amity.User | undefined {
      const cacheData = pullFromCache<Amity.User>(['user', 'get', story.creatorPublicId]);
      if (!cacheData?.data) return;
      return userLinkedObject(cacheData.data);
    },

    get storyTarget(): Amity.StoryTarget | undefined {
      if (!storyTargetCache?.data) return;
      return storyTargetLinkedObject(storyTargetCache.data);
    },

    get isSeen(): boolean {
      const cacheData = pullFromCache<Amity.timestamp>([STORY_KEY_CACHE.LAST_SEEN, story.targetId]);

      if (!storyTargetCache?.data) return false;

      const localLastSeen = cacheData?.data ? new Date(cacheData.data).getTime() : 0;
      const serverLastSeen =
        new Date(storyTargetCache?.data.lastStorySeenExpiresAt!).getTime() || 0;

      const expiresAt = new Date(story.expiresAt!).getTime();
      return Math.max(localLastSeen, serverLastSeen) >= expiresAt;
    },
  };
};
