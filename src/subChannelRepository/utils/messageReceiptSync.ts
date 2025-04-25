import { getMarkedMessageTopic, subscribeTopic } from '~/core/subscription';
import { getSubChannel } from '../api/getSubChannel';

const disposers: Record<string, () => void> = {};

const getParentChannelId = async (
  subChannelId: Amity.SubChannel['subChannelId'],
): Promise<Amity.SubChannel['channelId']> => {
  const cached = getSubChannel.locally(subChannelId);

  if (cached) {
    return cached.data.channelId;
  }

  const { data } = await getSubChannel(subChannelId);
  return data.channelId;
};

const registerTopicSubscribers = async (subChannelId: Amity.SubChannel['subChannelId']) => {
  const channelId = await getParentChannelId(subChannelId);
  const markedMessageTopic = getMarkedMessageTopic({ channelId, subChannelId });

  disposers[subChannelId] = subscribeTopic(markedMessageTopic);
};

/* begin_public_function
  id: subchannel.start_message_receipt_sync
*/
/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.startMessageReceiptSync(subChannelId)
 * ```
 *
 * Start reading a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to start reading
 * @return true if the reading of the sub channel had begun
 *
 * @category subChannel API
 * @async
 */

export const startMessageReceiptSync = async (
  subChannelId: Amity.SubChannel['subChannelId'],
): Promise<boolean> => {
  await registerTopicSubscribers(subChannelId);
  return true;
};
/* end_public_function */

/* begin_public_function
  id: subchannel.stop_message_receipt_sync
*/
/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.startMessageReceiptSync(subChannelId)
 * ```
 *
 * Start reading a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to start reading
 * @return true if the reading of the sub channel had begun
 *
 * @category subChannel API
 * @async
 */
export const stopMessageReceiptSync = (subChannelId: Amity.SubChannel['subChannelId']): boolean => {
  if (disposers[subChannelId]) disposers[subChannelId]();
  return true;
};
/* end_public_function */
