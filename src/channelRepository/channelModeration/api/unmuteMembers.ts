import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../../utils';

/* begin_public_function
  id: channel.moderation.unban_members
*/
/**
 * ```js
 * import { unbanMembers } from '@amityco/ts-sdk'
 *
 * await unbanMembers('channel-id-1', ['userId1', 'userId2'])
 * ```
 *
 * @param channelId of {@link Amity.Channel} where the users should be unbanned
 * @param userIds of the {@link Amity.InternalUser}'s to be unbanned
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Channel API
 * @async
 * */
export const unmuteMembers = async (
  channelId: Amity.Channel['channelId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/unmuteMembers', { userIds, channelId });

  const { data } = await client.http.put<{ success: boolean }>(
    `/api/v2/channel/${encodeURIComponent(channelId)}/users/mute`,
    {
      userIds,
      mutePeriod: 0,
    },
  );

  const { success } = data;

  return success;
};
/* end_public_function */
