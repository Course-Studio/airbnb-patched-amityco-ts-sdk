import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { prepareChannelPayload } from '../../utils';

/* begin_public_function
  id: channel.member.add
*/
/**
 * ```js
 * import { addMembers } from '@amityco/ts-sdk'
 * const updated = await addMembers(channelId, ['foo', 'bar'])
 * ```
 *
 * Adds a list of {@link Amity.InternalUser} to a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param userIds The list of IDs {@link Amity.InternalUser} to add
 * @returns A success boolean if the {@link Amity.InternalUser} were added to the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export const addMembers = async (
  channelId: Amity.Channel['channelId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/addMembers', channelId, userIds);

  const { data: payload } = await client.http.post<Amity.ChannelMembershipPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}/users`,
    { channelId, userIds },
  );

  /*
   * should fire event for each user that was added
   */
  userIds.forEach(id =>
    fireEvent('channel.membersAdded', {
      ...payload,
      channelUsers: payload.channelUsers.filter(u => u.userId === id),
    }),
  );

  const data = await prepareChannelPayload(payload);

  if (client.cache) ingestInCache(data);

  const { channelUsers } = data;
  return !!channelUsers.find(
    channelUser => channelUser.channelId === channelId && channelUser.membership === 'member',
  );
};
/* end_public_function */
