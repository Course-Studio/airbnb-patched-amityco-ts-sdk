import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareFollowStatusPayload } from '../utils';

/* begin_public_function
  id: user.relationship.decline_follow
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * await UserRepository.Relationship.declineMyFollower('foobar')
 * ```
 *
 * Decline the follow request or delete the follower
 *
 * @param userId the ID of the {@link Amity.InternalUser} follower
 * @returns A success boolean if the follow request was decline
 *
 * @category Follow API
 * @async
 */
export const declineMyFollower = async (userId: Amity.InternalUser['userId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('follow/declineMyFollower', userId);

  const { data } = await client.http.delete<Amity.FollowStatusPayload>(
    `/api/v4/me/followers/${userId}`,
  );

  if (client.cache) {
    ingestInCache(data);
  }

  const payload = prepareFollowStatusPayload(data);

  fireEvent('local.follow.requestDeclined', payload);

  return true;
};
/* end_public_function */
