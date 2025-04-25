import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { PinnedPostPaginationController } from './PinnedPostPaginationController';
import { PinnedPostQueryStreamController } from './PinnedPostQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { isNonNullable } from '~/utils';
import { LinkedObject } from '~/utils/linkedObject';
import { sortByLastCreated } from '~/core/query';

export class PinnedPostLiveCollectionController extends LiveCollectionController<
  'pinnedPost',
  Amity.PinnedPostLiveCollection,
  Amity.PinnedPost,
  PinnedPostPaginationController
> {
  private queryStreamController: PinnedPostQueryStreamController;

  private query: Amity.PinnedPostLiveCollection;

  constructor(
    query: Amity.PinnedPostLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.PinnedPost>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['pinnedPosts', 'collection', queryStreamId];
    const paginationController = new PinnedPostPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new PinnedPostQueryStreamController(
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
    return [] as Amity.Unsubscriber[];
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.PinnedPostLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    let data = (
      collection.data
        .map(id => pullFromCache<Amity.InternalPin>(['pin', 'get', id])!)
        .filter(isNonNullable)
        .map(({ data }) => data) ?? []
    ).map(LinkedObject.pinnedPost);

    data = this.applyFilter(data);

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      data,
      loading,
      error,
    });
  }

  private applyFilter(data: Amity.PinnedPost[]) {
    let pinnedPost = data;
    switch (this.query.sortBy) {
      case 'lastCreated':
        pinnedPost = pinnedPost.sort(({ post: postA }, { post: postB }) =>
          sortByLastCreated({ createdAt: postA?.createdAt! }, { createdAt: postB?.createdAt! }),
        );
        break;
      default:
        break;
    }
    return pinnedPost;
  }
}
