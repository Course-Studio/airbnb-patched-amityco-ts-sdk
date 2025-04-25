import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareFollowStatusPayload } from '../utils';

/* begin_public_function
  id: user.relationship.follow
*/
/**
 * ```js
 * import { follow } from '@amityco/ts-sdk'
 * const status = await follow('foobar')
 * ```
 *
 * Follow the user
 *
 * @param userId the ID of the {@link Amity.InternalUser}
 * @returns the status {@link Amity.FollowStatus}
 *
 * @category Follow API
 * @async
 */
export const follow = async (
  userId: Amity.InternalUser['userId'],
): Promise<Amity.Cached<Amity.FollowStatus>> => {
  const client = getActiveClient();
  client.log('follow/follow', userId);

  const { data } = await client.http.post<Amity.FollowStatusPayload>(
    `/api/v4/me/following/${userId}`,
  );

  const cachedAt = client.cache && Date.now();

  if (client.cache) {
    ingestInCache(data, { cachedAt });
  }

  const payload = prepareFollowStatusPayload(data);

  if (data.follows[0].status === 'accepted') {
    fireEvent('local.follow.created', payload);
  } else {
    fireEvent('local.follow.requested', payload);
  }

  return {
    data: data.follows[0],
    cachedAt,
  };
};
/* end_public_function */
