import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { prepareFollowStatusPayload } from '../utils';

/* begin_public_function
  id: user.relationship.accept_follow
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * await UserRepository.Relationship.acceptMyFollower('foobar')
 * ```
 *
 * Accept the follow request
 *
 * @param userId the ID of the {@link Amity.InternalUser} follower
 * @returns A success boolean if the follow request was accepted
 *
 * @category Follow API
 * @async
 */
export const acceptMyFollower = async (userId: Amity.InternalUser['userId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('follow/acceptMyFollower', userId);

  const { data } = await client.http.post<Amity.FollowStatusPayload>(
    `/api/v4/me/followers/${userId}`,
  );

  if (client.cache) {
    ingestInCache(data);
  }

  const payload = prepareFollowStatusPayload(data);

  fireEvent('local.follow.accepted', payload);

  return true;
};
/* end_public_function */
