import { getActiveClient } from '~/client/api';

/* begin_public_function
  id: channel.unmute
*/
const CHANNEL_UNMUTE_PERIOD = 0;
/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk'
 * const isMuted = await ChannelRepository.unmute('foobar')
 * ```
 *
 * Mutes a {@link Amity.Channel} object
 *
 * @param channelId the {@link Amity.Channel} to mute
 * @returns A success boolean if the {@link Amity.Channel} was muted
 *
 * @category Channel API
 * @async
 */
export const unmuteChannel = async (channelId: Amity.Channel['channelId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/unmuteChannel', channelId);

  const { data } = await client.http.put<{ success: boolean }>(
    `/api/v2/channel/${encodeURIComponent(channelId)}/mute`,
    /*
     * Setting mute period as 0 is the same as unmuting the channel
     */
    { mutePeriod: CHANNEL_UNMUTE_PERIOD },
  );

  const { success } = data;

  return success;
};
/* end_public_function */
