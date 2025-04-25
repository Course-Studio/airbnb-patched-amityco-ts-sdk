import { pullFromCache, queryCache } from '~/cache/api';
import { postLinkedObject } from './postLinkedObject';

export const pinnedPostLinkedObject = (pinnedPost: Amity.RawPin): Amity.PinnedPost => {
  const postCached = pullFromCache<Amity.InternalPost>(['post', 'get', pinnedPost.referenceId]);
  const pinnedBy = queryCache<Amity.InternalUser>(['user', 'get'])!.find(cache => {
    return cache.data?.userInternalId === pinnedPost.pinnedBy;
  })?.data!;

  return {
    ...pinnedPost,
    pinnedBy,
    get post(): Amity.Post | undefined {
      if (!postCached?.data) return;
      return postLinkedObject(postCached.data);
    },
    get target(): Amity.PinTarget | undefined {
      const pinTarget = pullFromCache<Amity.InternalPinTarget>([
        'pinTarget',
        'get',
        postCached?.data.targetId,
      ]);

      if (!pinTarget?.data) return;
      return pinTarget?.data;
    },
  };
};
