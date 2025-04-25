import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareFollowStatusPayload } from '../utils';

/* begin_public_function
  id: user.relationship.unfollow
*/
/**
 * ```js
 * import { unfollow } from '@amityco/ts-sdk'
 * await unfollow('foobar')
 * ```
 *
 * Cancel the follow request or unfollow the user
 *
 * @param userId the ID of the {@link Amity.InternalUser}
 * @returns A success boolean if the user {@link Amity.InternalUser} was unfollowed
 *
 * @category Follow API
 * @async
 */
export const unfollow = async (userId: Amity.InternalUser['userId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('follow/unfollow', userId);

  const { data } = await client.http.delete<Amity.FollowStatusPayload>(
    `/api/v4/me/following/${userId}`,
  );

  if (client.cache) {
    ingestInCache(data);
  }

  const payload = prepareFollowStatusPayload(data);

  fireEvent('local.follow.unfollowed', payload);

  return true;
};
/* end_public_function */
