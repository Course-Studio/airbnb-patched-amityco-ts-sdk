import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../../utils';
import { fireEvent } from '~/core/events';

/* begin_public_function
  id: channel.moderation.add_roles
*/
/**
 * ```js
 * import { addRole } from '@amityco/ts-sdk'
 * const updated = await addRole(channelId, 'foo', ['bar'])
 * ```
 *
 * Adds an {@link Amity.Role} to a list of {@link Amity.InternalUser} on a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param roleId The ID of the {@link Amity.Role} to apply
 * @param userId Array of IDs of the {@link Amity.InternalUser} to perform
 * @returns A success boolean if the {@link Amity.Role} were added to list of {@link Amity.InternalUser} in the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export const addRole = async (
  channelId: Amity.Channel['channelId'],
  roleId: Amity.Role['roleId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/addRole', channelId, roleId, userIds);

  const { data: payload } = await client.http.post<Amity.ChannelMembershipPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}/users/roles`,
    { channelId, role: roleId, userIds },
  );

  const data = await prepareChannelPayload(payload);

  if (client.cache) ingestInCache(data);

  fireEvent('local.channel-moderator.role-added', data);

  const { channelUsers } = data;
  return !!channelUsers.find(
    channelUser => channelUser.channelId === channelId && channelUser.roles.includes(roleId),
  );
};
/* end_public_function */
