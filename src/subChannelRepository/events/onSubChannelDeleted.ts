import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';
import { prepareSubChannelPayload } from '../utils';
import { addFlagIsDeletedSubChannelUnreadBySubChannelId } from '../../marker/utils/addFlagIsDeletedSubChannelUnreadBySubChannelId';
import { reCalculateChannelUnreadInfo } from '~/marker/utils/reCalculateChannelUnreadInfo';

/**
 * ```js
 * import { onSubChannelDeleted } from '@amityco/ts-sdk'
 * const dispose = onSubChannelDeleted(subChannel => {
 *   // ...
 * })
 * ```
 *
 * Fired when any {@link Amity.SubChannel} have been deleted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Channel Events
 */
export const onSubChannelDeleted = (callback: Amity.Listener<Amity.SubChannel>) => {
  const client = getActiveClient();

  const filter = async (rawPayload: Amity.SubChannelPayload) => {
    const payload = await prepareSubChannelPayload(rawPayload);

    if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
      payload.messageFeeds.forEach(subChannel => {
        addFlagIsDeletedSubChannelUnreadBySubChannelId(subChannel.subChannelId);
        reCalculateChannelUnreadInfo(subChannel.channelId);
      });
    }

    ingestInCache(payload);
    callback(payload.messageFeeds[0]);
  };

  const disposers = [
    createEventSubscriber(client, 'onSubChannelDeleted', 'message-feed.deleted', filter),
    createEventSubscriber(
      client,
      'local.message-feed.deleted',
      'local.message-feed.deleted',
      payload => callback(payload.messageFeeds[0]),
    ),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
