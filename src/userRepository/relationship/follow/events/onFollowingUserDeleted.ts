import { pullFromCache, queryCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client';
import { createEventSubscriber } from '~/core/events';
import { getResolver } from '~/core/model';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';

export const onFollowingUserDeleted =
  ({ userId }: { userId: string }) =>
  (callback: Amity.Listener<Amity.InternalFollowStatus>) => {
    const client = getActiveClient();

    const filter = (data: Amity.UserPayload) => {
      const userPayload = prepareUserPayload(data);

      ingestInCache(userPayload);

      const cacheData = pullFromCache<Amity.InternalFollowStatus>([
        'follow',
        'get',
        getResolver('follow')({
          from: userId,
          to: userPayload.users[0].userId,
        }),
      ]);

      if (!cacheData) return;

      callback(cacheData?.data);
    };

    return createEventSubscriber(client, 'user.deleted', 'user.deleted', filter);
  };
