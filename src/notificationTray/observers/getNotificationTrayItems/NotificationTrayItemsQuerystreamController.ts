import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';

export class NotificationTrayItemsQuerystreamController extends QueryStreamController<
  Amity.NotificationTrayPayload,
  Amity.NotificationTrayItemLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.NotificationTrayPayload,
  ) => Amity.ProcessedNotificationTrayPayload;

  constructor(
    query: Amity.NotificationTrayItemLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (
      response: Amity.NotificationTrayPayload,
    ) => Amity.ProcessedNotificationTrayPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.NotificationTrayPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.NotificationTrayPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.notificationTrayItems.map(getResolver('notificationTrayItem')),
      });
    } else {
      const collection = pullFromCache<Amity.NotificationTrayItemLiveCollectionCache>(
        this.cacheKey,
      )?.data;

      const notifications = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [
          ...new Set([
            ...notifications,
            ...response.notificationTrayItems.map(getResolver('notificationTrayItem')),
          ]),
        ],
      });
    }
  }
}
