import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';
import { pullFromCache, upsertInCache } from '~/cache/api';
import { createEventSubscriber } from '~/core/events';
import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';

export const onUserDeleted =
  (channelId: string) =>
  (
    callback: (channel: Amity.StaticInternalChannel, member: Amity.Membership<'channel'>) => void,
  ) => {
    const client = getActiveClient();

    const filter = (payload: Amity.UserPayload) => {
      const userPayload = prepareUserPayload(payload);

      if (userPayload.users.length === 0) return;

      const user = userPayload.users[0];

      ingestInCache(userPayload);

      const channelUserCacheKey = getResolver('channelUsers')({
        channelId,
        userId: user.userId,
      });

      const cacheData = pullFromCache<Amity.Membership<'channel'>>([
        'channelUsers',
        'get',
        channelUserCacheKey,
      ])?.data!;

      upsertInCache(['channelUsers', 'get', channelUserCacheKey], {
        ...cacheData,
        user,
      });

      const channel = pullFromCache<Amity.StaticInternalChannel>([
        'channel',
        'get',
        channelId,
      ])?.data;

      if (!channel) return;

      callback(channel, cacheData);
    };

    return createEventSubscriber(client, 'user.deleted', 'user.deleted', filter);
  };
