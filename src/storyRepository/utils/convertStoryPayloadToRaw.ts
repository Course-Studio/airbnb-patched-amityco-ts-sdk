import { getActiveClient } from '~/client';
import { YEAR } from '~/utils/constants';
import { pullFromCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { ingestInCache } from '~/cache/api/ingestInCache';

export const convertStoryPayloadToRaw = (
  payload: Amity.StoryCreatePayload,
): Amity.StoryWithOptimisticPayload => {
  const client = getActiveClient();

  const now = new Date();
  const expiresAt = now.getTime() + YEAR;
  const expiresAtDate = new Date(expiresAt).toISOString();

  let storyTarget = pullFromCache<Amity.RawStoryTarget>([
    STORY_KEY_CACHE.STORY_TARGET,
    'get',
    payload.targetId,
  ])?.data;

  if (!storyTarget) {
    // Save mock story target to cache
    storyTarget = {
      targetType: payload.targetType,
      targetId: payload.targetId,
      lastStoryExpiresAt: expiresAtDate,
      targetPublicId: payload.targetId,
      targetUpdatedAt: now.toISOString(),
    };

    ingestInCache({ storyTargets: [storyTarget] });
  }

  return {
    stories: [
      {
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        flagCount: 0,
        hashFlag: null,
        reactions: {},
        reactionsCount: 0,
        storyId: payload.referenceId,
        path: '',
        creatorId: client.userId || '',
        creatorPublicId: client.userId || '',
        targetPublicId: payload.targetId,
        comments: [],
        commentsCount: 0,
        isDeleted: false,
        hasFlaggedComment: false,
        mentionedUsers: [],
        impression: 0,
        reach: 0,
        expiresAt: new Date(expiresAt).toISOString(),
        ...payload,
      },
    ],
    categories: [],
    communityUsers: [],
    comments: [],
    files: [],
    users: [],
    communities: [],
  };
};
