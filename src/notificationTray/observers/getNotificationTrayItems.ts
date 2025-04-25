import { getActiveClient } from '~/client/api';
import { dropFromCache } from '~/cache/api';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { NotificationTrayItemsLiveCollectionController } from './getNotificationTrayItems/NotificationTrayItemsLiveCollectionController';

/**
 * Get notification tray items for a notification tray page
 *
 * @param params the limit query parameters
 * @param callback the callback to be called when the notification tray items are updated
 * @returns items in the notification tray
 *
 * @category Notification tray items Live Collection
 *
 */
export const getNotificationTrayItems = (
  params: Amity.LiveCollectionParams<Amity.NotificationTrayItemLiveCollection>,
  callback: Amity.LiveCollectionCallback<Amity.NotificationTrayItem>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getNotificationTrayItems(tmpid: ${timestamp}) > listen`);

  const notiTrayItemsLiveCollection = new NotificationTrayItemsLiveCollectionController(
    params,
    callback,
  );
  const disposers = notiTrayItemsLiveCollection.startSubscription();

  const cacheKey = notiTrayItemsLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getNotificationTrayItems(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
