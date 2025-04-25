import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { upsertInCache } from '~/cache/api';
import { prepareFollowStatusPayload } from '../../follow/utils';

/* begin_public_function
  id: user.relationship.unblock
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const unblockedUser = await UserRepository.blockUser('userId')
 * ```
 *
 * Blocks a {@link Amity.InternalUser}
 *
 * @param userId The ID of the {@link Amity.InternalUser} to unblock
 * @returns the unblocked {@link Amity.InternalUser} object
 *
 * @category Post API
 * @async
 */
export const unBlockUser = async (
  userId: Amity.InternalUser['userId'],
): Promise<Amity.BlockedPayload> => {
  const client = getActiveClient();

  client.log('user/unBlockUser', userId);
  const { data } = await client.http.delete<Amity.BlockedPayload>(
    `/api/v4/me/user-blocks/${userId}`,
  );

  const cachedAt = client.cache && Date.now();

  const { follows, followCounts } = data;

  const followStatus = { follows };

  if (client.cache) {
    ingestInCache(followStatus, { cachedAt });
    upsertInCache(['followInfo', 'get', userId], followCounts[0], { cachedAt });
  }

  const payload = prepareFollowStatusPayload(followStatus);

  fireEvent('local.follow.created', payload);

  return data;
};
/* end_public_function */
