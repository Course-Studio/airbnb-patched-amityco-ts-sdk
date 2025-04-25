import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { prepareChannelPayload } from '../../utils';

/* begin_public_function
  id: channel.member.remove
*/
/**
 * ```js
 * import { removeMembers } from '@amityco/ts-sdk'
 * const updated = await removeMembers(channelId, ['foo', 'bar'])
 * ```
 *
 * Removes a list of {@link Amity.InternalUser} from a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param userIds The list of IDs {@link Amity.InternalUser} to remove
 * @returns A success boolean if the list of {@link Amity.InternalUser} were removed from the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export const removeMembers = async (
  channelId: Amity.Channel['channelId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/removeMembers', channelId, userIds);

  const { data: payload } = await client.http.delete<Amity.ChannelMembershipPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}/users`,
    { data: { channelId, userIds } },
  );

  /*
   * should fire event for each user that was removed
   */
  userIds.forEach(id =>
    fireEvent('channel.membersRemoved', {
      ...payload,
      channelUsers: payload.channelUsers.filter(u => u.userId === id),
    }),
  );

  const data = await prepareChannelPayload(payload);

  if (client.cache) ingestInCache(data);

  const { channelUsers } = data;
  return !!channelUsers.find(
    channelUser => channelUser.channelId === channelId && channelUser.membership !== 'member',
  );
};
/* end_public_function */
