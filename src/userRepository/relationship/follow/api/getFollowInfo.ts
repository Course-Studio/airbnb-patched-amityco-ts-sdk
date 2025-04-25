import { getActiveClient } from '~/client/api';
import { pullFromCache, pushToCache } from '~/cache/api';

/**
 * ```js
 * import { getFollowInfo } from '@amityco/ts-sdk'
 * const { data: followInfo } = await getFollowInfo('foobar')
 * ```
 *
 * Fetches the number of followers, followings, pending requests and the follow status for current user
 *
 * @param userId the ID of the {@link Amity.InternalUser}
 * @returns the associated {@link Amity.FollowInfo} object
 *
 * @category Follow API
 * @async
 */
export const getFollowInfo = async (
  userId: Amity.InternalUser['userId'],
): Promise<Amity.Cached<Amity.FollowInfo>> => {
  const client = getActiveClient();
  client.log('follow/getFollowInfo', userId);

  const { data } = await client.http.get<Amity.FollowInfoMePayload | Amity.FollowInfoPayload>(
    client.userId === userId ? `/api/v4/me/followInfo` : `/api/v5/users/${userId}/followInfo`,
  );

  const cachedAt = client.cache && Date.now();
  const followInfo =
    'follows' in data
      ? {
          ...data.followCounts[0],
          status: data.follows?.[0]?.status,
        }
      : data.followCounts[0];

  if (client.cache) {
    pushToCache(['followInfo', 'get', userId], followInfo, {
      cachedAt,
    });
  }

  return {
    data: followInfo,
    cachedAt,
  };
};

/**
 * ```js
 * import { getFollowInfo } from '@amityco/ts-sdk'
 * const { data: followInfo } = getFollowInfo.locally('foobar')
 * ```
 *
 * Fetches the number of followers, followings, pending requests and the follow status for current user from cache
 *
 * @param userId the ID of the {@link Amity.InternalUser}
 * @returns the associated {@link Amity.FollowInfo} object
 *
 * @category Follow API
 */
getFollowInfo.locally = (
  userId: Amity.InternalUser['userId'],
): Amity.Cached<Amity.FollowInfo> | undefined => {
  const client = getActiveClient();
  client.log('follow/getFollowInfo.locally', userId);

  if (!client.cache) {
    return;
  }

  const cached = pullFromCache<Amity.FollowInfo>(['followInfo', 'get', userId]);

  if (!cached) {
    return;
  }

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
