import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { NotificationTrayItemsPaginationController } from './NotificationTrayItemsPaginationController';
import { NotificationTrayItemsQuerystreamController } from './NotificationTrayItemsQuerystreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { prepareNotificationTrayItemsPayload } from '~/notificationTray/utils/prepareNotificationTrayItemsPayload';
import { isNonNullable } from '~/utils';
import { LinkedObject } from '~/utils/linkedObject';

export class NotificationTrayItemsLiveCollectionController extends LiveCollectionController<
  'notificationTrayItem',
  Amity.NotificationTrayItemLiveCollection,
  Amity.NotificationTrayItem,
  NotificationTrayItemsPaginationController
> {
  private queryStreamController: NotificationTrayItemsQuerystreamController;

  private query: Amity.NotificationTrayItemLiveCollection;

  constructor(
    query: Amity.NotificationTrayItemLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.NotificationTrayItem>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['notificationTrayItem', 'collection', queryStreamId];
    const paginationController = new NotificationTrayItemsPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new NotificationTrayItemsQuerystreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareNotificationTrayItemsPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.NotificationTrayItemLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.NotificationTrayPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'notificationTrayItem'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  // eslint-disable-next-line class-methods-use-this
  startSubscription() {
    return [] as Amity.Unsubscriber[];
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.NotificationTrayItemLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) return;

    const data = (
      collection.data
        .map(id =>
          pullFromCache<Amity.InternalNotificationTrayItem>(['notificationTrayItem', 'get', id]),
        )
        .filter(isNonNullable)
        .map(({ data }) => data) ?? []
    ).map(LinkedObject.notificationTray);

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }
}
