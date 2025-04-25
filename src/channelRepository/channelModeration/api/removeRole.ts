import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../../utils';
import { fireEvent } from '~/core/events';

/* begin_public_function
  id: channel.moderation.remove_roles
*/
/**
 * ```js
 * import { removeRole } from '@amityco/ts-sdk'
 * const updated = await removeRole(channelId, 'foo', ['bar'])
 * ```
 *
 * Removes an {@link Amity.Role} from a list of {@link Amity.InternalUser} on a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param roleId The ID of the {@link Amity.Role} to apply
 * @param userIds Array of IDs of the {@link Amity.InternalUser} to perform
 * @returns A success boolean if the {@link Amity.Role} were removed from list of {@link Amity.InternalUser} in the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export const removeRole = async (
  channelId: Amity.Channel['channelId'],
  roleId: Amity.Role['roleId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/removeRole', channelId, roleId, userIds);

  const { data: payload } = await client.http.delete<Amity.ChannelMembershipPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}/users/roles`,
    { data: { channelId, role: roleId, userIds } },
  );

  const data = await prepareChannelPayload(payload);

  if (client.cache) ingestInCache(data);

  fireEvent('local.channel-moderator.role-removed', data);

  const { channelUsers } = data;
  return !!channelUsers.find(
    channelUser => channelUser.channelId === channelId && !channelUser.roles.includes(roleId),
  );
};
/* end_public_function */
