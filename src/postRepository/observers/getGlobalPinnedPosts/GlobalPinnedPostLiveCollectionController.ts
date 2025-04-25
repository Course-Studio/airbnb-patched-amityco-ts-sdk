import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { GlobalPinnedPostPaginationController } from './GlobalPinnedPostPaginationController';
import { GlobalPinnedPostQueryStreamController } from './GlobalPinnedPostQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { isNonNullable } from '~/utils';
import { LinkedObject } from '~/utils/linkedObject';
import { onPostDeleted } from '~/postRepository/events';
import { EnumPostActions } from '../enums';
import { onLocalPostDeleted } from '~/postRepository/events/onLocalPostDeleted';

export class GlobalPinnedPostLiveCollectionController extends LiveCollectionController<
  'pinnedPost',
  Amity.GlobalPinnedPostLiveCollection,
  Amity.PinnedPost,
  GlobalPinnedPostPaginationController
> {
  private queryStreamController: GlobalPinnedPostQueryStreamController;

  private query: Amity.GlobalPinnedPostLiveCollection;

  constructor(
    query: Amity.GlobalPinnedPostLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.PinnedPost>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['pinnedPosts', 'collection', queryStreamId];
    const paginationController = new GlobalPinnedPostPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new GlobalPinnedPostQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      response => response,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.PostLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.PinnedPostPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'pinnedPost'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  // eslint-disable-next-line class-methods-use-this
  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onLocalPostDeleted, action: EnumPostActions.OnPostDeleted },
      {
        fn: onPostDeleted,
        action: EnumPostActions.OnPostDeleted,
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.PinnedPostLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = (
      collection.data
        .map(id => pullFromCache<Amity.InternalPin>(['pin', 'get', id])!)
        .filter(isNonNullable)
        .map(({ data }) => data) ?? []
    ).map(LinkedObject.pinnedPost);

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      data,
      loading,
      error,
    });
  }
}
