import { pullFromCache, pushToCache } from '~/cache/api';
import { getUser } from '~/userRepository/internalApi/getUser';
import { getCommunity } from '~/communityRepository/api/getCommunity';
import { STORY_KEY_CACHE } from '../constants';

export const createOptimisticTarget = async ({
  targetId,
  targetType,
}: {
  targetType: string;
  targetId: string;
}) => {
  const targetCache = pullFromCache<Amity.RawStoryTarget>([
    STORY_KEY_CACHE.STORY_TARGET,
    'get',
    targetId,
  ]);

  if (!targetCache) {
    let optimisticTarget = {
      targetId,
      targetType,
    };

    if (targetType === 'community') {
      const community = await getCommunity(targetId);
      optimisticTarget = {
        ...optimisticTarget,
        targetPublicId: community.data.communityId,
        targetUpdatedAt: community.data.updatedAt ?? new Date().toISOString(),
      } as Amity.RawStoryTarget;
    }

    if (targetType === 'user') {
      const user = await getUser(targetId);

      optimisticTarget = {
        ...optimisticTarget,
        targetPublicId: user.data.userPublicId,
        targetUpdatedAt: user.data.updatedAt ?? new Date().toISOString(),
      } as Amity.RawStoryTarget;
    }

    pushToCache([STORY_KEY_CACHE.STORY_TARGET, 'get', targetId], optimisticTarget);
  }
};
