import { get } from 'http';
import { pullFromCache, pushToCache, queryCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';
import { getResolver } from '~/core/model';

/**
 * ```js
 * import { onMessageMarked } from '@amityco/ts-sdk'
 * const dispose = onMessageMarked(markedMessage => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been mark read/delivered
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Marker Events
 */
export const onMessageMarked = (
  callback: Amity.Listener<Amity.MessageMarker>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = (payload: Amity.Events['marker.marked-message']) => {
    ingestInCache(payload);

    const cacheCollection = queryCache<Amity.MessageLiveCollectionCache>(['message', 'collection']);
    const { contentMarkers, feedMarkers } = payload;

    if (cacheCollection && cacheCollection?.length > 0 && feedMarkers?.length > 0) {
      /**
       * in case of read the message collection,
       * use feedId of the feedMarkers to check if it equal to subChannelId.
       */
      const currentMessageCollection = cacheCollection.filter(currentMessage => {
        return currentMessage.data?.query?.subChannelId === feedMarkers[0].feedId;
      });

      if (currentMessageCollection.length > 0 && contentMarkers?.length > 0) {
        const currentMessages =
          currentMessageCollection[0].data?.data
            ?.map(messageId => pullFromCache<Amity.InternalMessage>(['message', 'get', messageId])!)
            .map(({ data }) => data)
            .filter(Boolean) ?? [];

        currentMessages.forEach(message => {
          const cacheKeyMessageMarker = [
            'messageMarker',
            'get',
            getResolver('messageMarker')({
              creatorId: message.creatorPrivateId,
              feedId: message.subChannelId,
              contentId: message.messageId,
            }),
          ];

          const messageMarker = pullFromCache<Amity.MessageMarker>(cacheKeyMessageMarker)?.data;

          if (!messageMarker) return;

          const isSameSubChannelId = contentMarkers[0].feedId === messageMarker.feedId;
          const isReadCountLatest = contentMarkers[0].readCount > messageMarker.readCount!;
          const isDeliveredCountLatest =
            contentMarkers[0]?.deliveredCount > messageMarker.deliveredCount!;

          if (isSameSubChannelId) {
            const newCacheData = {
              ...messageMarker,
              readCount: isReadCountLatest ? contentMarkers[0].readCount : messageMarker.readCount!,
              deliveredCount: isDeliveredCountLatest
                ? contentMarkers[0].deliveredCount
                : messageMarker.deliveredCount!,
            };
            pushToCache(cacheKeyMessageMarker, newCacheData);
          }
        });
      }
    }

    callback(payload.contentMarkers[0]);
  };

  return createEventSubscriber(
    client,
    'messageMarker/onMessageMarked',
    'marker.marked-message',
    filter,
  );
};
