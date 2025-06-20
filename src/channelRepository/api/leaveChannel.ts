import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';

/* begin_public_function
  id: channel.leave
*/
/**
 * ```js
 * import { leaveChannel } from '@amityco/ts-sdk'
 * const isLeft = await leaveChannel('foobar')
 * ```
 *
 * Leave a {@link Amity.Channel} object
 *
 * @param channelId the {@link Amity.Channel} to leave
 * @returns A success boolean if the {@link Amity.Channel} was left
 *
 * @category Channel API
 * @async
 */
export const leaveChannel = async (channelId: Amity.Channel['channelId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/leaveChannel', channelId);

  const { data: payload } = await client.http.delete<Amity.ChannelMembershipPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}/leave`,
  );

  const data = await prepareChannelPayload(payload);

  if (client.cache) ingestInCache(data);

  const { channelUsers } = data;

  return !!channelUsers.find(
    channelUser => channelUser.channelId === channelId && channelUser.membership !== 'member',
  );
};
/* end_public_function */
