import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../../utils';

/* begin_public_function
  id: channel.moderation.ban_members
*/
/**
 * ```js
 * import { banMembers } from '@amityco/ts-sdk'
 *
 * await banMembers('channel-id-1', ['userId1', 'userId2'])
 * ```
 *
 * @param channelId of {@link Amity.Channel} from which the users should be banned
 * @param userIds of the {@link Amity.InternalUser}'s to be banned
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Channel API
 * @async
 * */
export const banMembers = async (
  channelId: Amity.Channel['channelId'],
  userIds: Amity.InternalUser['userId'][],
): Promise<Amity.Cached<Amity.Membership<'channel'>[]>> => {
  const client = getActiveClient();
  client.log('channel/banMembers', { userIds, channelId });

  const { data: payload } = await client.http.put<Amity.ChannelPayload>(
    `/api/v3/channels/${channelId}/users/ban`,
    {
      userIds,
    },
  );

  const preparedPayload = await prepareChannelPayload(payload);
  const { channelUsers } = preparedPayload;

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(preparedPayload, { cachedAt });

  return {
    data: channelUsers?.filter(user => user.membership === 'banned')!,
    cachedAt,
  };
};
/* end_public_function */
