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
export const unbanMembers = async (
  channelId: Amity.Channel['channelId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<Amity.Cached<Amity.Membership<'channel'>[]>> => {
  const client = getActiveClient();
  client.log('channel/unbanMembers', { userIds, channelId });

  const { data: payload } = await client.http.put<Amity.ChannelPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}/users/unban`,
    {
      userIds,
    },
  );

  const preparedPayload = await prepareChannelPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(preparedPayload, { cachedAt });

  const { channelUsers } = preparedPayload;

  return {
    data: channelUsers?.filter(user => user.membership === 'member')!,
    cachedAt,
  };
};
/* end_public_function */
