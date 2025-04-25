import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ReactionPaginationController } from './ReactionPaginationController';
import { ReactionQueryStreamController } from './ReactionQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';

import { onReactorAdded, onReactorRemoved } from '../../events';

import { LinkedObject } from '~/utils/linkedObject';
import { onReactorRemovedLocal } from '~/reactionRepository/events/onReactorRemovedLocal';
import { onReactorAddedLocal } from '~/reactionRepository/events/onReactorAddedLocal';

export class ReactionLiveCollectionController extends LiveCollectionController<
  'reaction',
  Amity.ReactionLiveCollection,
  Amity.Reactor,
  ReactionPaginationController
> {
  private queryStreamController: ReactionQueryStreamController;

  private query: Amity.ReactionLiveCollection;

  constructor(
    query: Amity.ReactionLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Reactor>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['reaction', 'collection', queryStreamId];
    const paginationController = new ReactionPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new ReactionQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      payload => payload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.ReactionLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.ReactionPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'reaction'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      {
        fn: callback => onReactorAdded(this.query.referenceType, this.query.referenceId, callback),
        action: Amity.ReactionActionTypeEnum.OnAdded,
      },
      {
        fn: callback =>
          onReactorRemoved(this.query.referenceType, this.query.referenceId, callback),
        action: Amity.ReactionActionTypeEnum.OnRemoved,
      },
      {
        fn: callback =>
          onReactorRemovedLocal(this.query.referenceType, this.query.referenceId, callback),
        action: Amity.ReactionActionTypeEnum.OnRemoved,
      },
      {
        fn: callback =>
          onReactorAddedLocal(this.query.referenceType, this.query.referenceId, callback),
        action: Amity.ReactionActionTypeEnum.OnRemoved,
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.ReactionLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data =
      collection.data
        .map(reactorId => pullFromCache<Amity.InternalReactor>(['reactor', 'get', reactorId])!)
        .filter(Boolean)
        .map(({ data }) => LinkedObject.reactor(data)) ?? [];

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
