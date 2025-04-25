import { getActiveClient } from '~/client/api';
import { ASCError } from '~/core/errors';

/* begin_public_function
  id: channel.mute
*/
const MUTE_FOREVER = -1;
/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk'
 * const isMuted = await ChannelRepository.muteChannel('channel-id', 100)
 * ```
 *
 * Mutes a {@link Amity.Channel} object
 *
 * @param channelId the {@link Amity.Channel} to mute
 * @param mutePeriod the duration to be muted
 * @returns A success boolean if the {@link Amity.Channel} was muted
 *
 * @category Channel API
 * @async
 */
export const muteChannel = async (
  channelId: Amity.Channel['channelId'],
  mutePeriod = MUTE_FOREVER,
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/muteChannel', channelId);

  if (mutePeriod !== MUTE_FOREVER && mutePeriod < 0)
    throw new ASCError(
      `Mute Period can only be positive numbers or ${MUTE_FOREVER}(mute forever)`,
      Amity.ClientError.INVALID_PARAMETERS,
      Amity.ErrorLevel.ERROR,
    );

  const { data } = await client.http.put<{ success: boolean }>(
    `/api/v2/channel/${encodeURIComponent(channelId)}/mute`,
    { mutePeriod },
  );

  const { success } = data;

  return success;
};
/* end_public_function */
