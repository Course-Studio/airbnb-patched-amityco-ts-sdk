import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';
import { pullFromCache, pushToCache, upsertInCache } from '~/cache/api';
import { createEventSubscriber } from '~/core/events';
import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';

/**
 * ```js
 * import { onUserDeleted } from '@amityco/ts-sdk'
 * const dispose = onUserDeleted((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.Community} has been joined
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export const onUserDeleted =
  (communityId: string) =>
  (callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void) => {
    const client = getActiveClient();

    const filter = (payload: Amity.UserPayload) => {
      const userPayload = prepareUserPayload(payload);

      if (userPayload.users.length === 0) return;

      const user = userPayload.users[0];

      ingestInCache(userPayload);

      const communityUserCacheKey = getResolver('communityUsers')({
        communityId,
        userId: user.userId,
      });

      const cacheData = pullFromCache<Amity.Membership<'community'>>([
        'communityUsers',
        'get',
        communityUserCacheKey,
      ])?.data!;

      pushToCache(['communityUsers', 'get', communityUserCacheKey], {
        ...cacheData,
        user,
      });

      const community = pullFromCache<Amity.Community>(['community', 'get', communityId])?.data!;

      callback(community, [
        {
          ...cacheData,
          user,
        },
      ]);
    };

    return createEventSubscriber(client, 'user.deleted', 'user.deleted', filter);
  };
