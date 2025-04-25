import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';
import { prepareSubChannelPayload } from '../utils';
import { persistOptimisticUnreadInfo } from '../utils/persistOptimisticUnreadInfo';

/**
 * ```js
 * import { onChannelSubCreated } from '@amityco/ts-sdk'
 * const dispose = onSubChannelCreated(subChannel => {
 *   // ...
 * })
 * ```
 *
 * Fired when any {@link Amity.SubChannel} have been created
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Channel Events
 */
export const onSubChannelCreated = (callback: Amity.Listener<Amity.SubChannel>) => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.SubChannelPayload) => {
    const payload = await prepareSubChannelPayload(rawPayload);

    // optimistically create subChannelUnreadInfo
    if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
      rawPayload.messageFeeds.forEach(subChannel => {
        persistOptimisticUnreadInfo({
          channelId: subChannel.channelId,
          subChannelId: subChannel.messageFeedId,
          createdAt: subChannel.createdAt,
          updatedAt: subChannel.updatedAt,
        });
      });
    }

    ingestInCache(payload);
    callback(payload.messageFeeds[0]);
  };

  return createEventSubscriber(client, 'onSubChannelCreated', 'message-feed.created', filter);
};
