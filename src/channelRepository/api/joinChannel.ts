import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils';

/* begin_public_function
  id: channel.join
*/
/**
 * ```js
 * import { joinChannel } from '@amityco/ts-sdk'
 * const isJoined = await joinChannel('foobar')
 * ```
 *
 * Joins a {@link Amity.Channel} object
 *
 * @param channelId the {@link Amity.Channel} to join
 * @returns A success boolean if the {@link Amity.Channel} was joined
 *
 * @category Channel API
 * @async
 */
export const joinChannel = async (channelId: Amity.Channel['channelId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/joinChannel', channelId);

  const { data: payload } = await client.http.post<Amity.ChannelMembershipPayload>(
    `/api/v3/channels/${encodeURIComponent(channelId)}/join`,
  );

  const data = await prepareChannelPayload(payload);

  if (client.cache) ingestInCache(data);

  const { channelUsers } = data;

  return !!channelUsers.find(
    channelUser => channelUser.channelId === channelId && channelUser.membership === 'member',
  );
};
/* end_public_function */
