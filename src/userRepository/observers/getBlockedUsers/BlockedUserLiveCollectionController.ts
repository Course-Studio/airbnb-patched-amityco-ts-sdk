import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { BlockedUserPaginationController } from './BlockedUserPaginationController';
import { BlockedUserQueryStreamController } from './BlockedUserQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { isNonNullable } from '~/utils';
import { prepareBlockedUserPayload } from '~/userRepository/utils/prepareBlockedUserPayload';
import { LinkedObject } from '~/utils/linkedObject';
import { onUserDeleted } from '~/userRepository/events';
import { EnumUserActions } from '../enums';
import { onLocalUserFollowed, onUserFollowed } from '~/userRepository/relationship/follow/events';
import { convertEventPayload } from '~/utils/event';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';

export class BlockedUserLiveCollectionController extends LiveCollectionController<
  'blockUser',
  Amity.BlockedUsersLiveCollection,
  Amity.User,
  BlockedUserPaginationController
> {
  private queryStreamController: BlockedUserQueryStreamController;

  private query: Amity.BlockedUsersLiveCollection;

  constructor(
    query: Amity.BlockedUsersLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.User>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['blockedUsers', 'collection', queryStreamId];
    const paginationController = new BlockedUserPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new BlockedUserQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareBlockedUserPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.BlockedUserLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.BlockedUserPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'blockUser'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      {
        fn: onUserDeleted,
        action: EnumUserActions.OnUserDeleted,
      },
      // In the case of unblocking a user, we need to subscribe to the follow events
      {
        fn: convertEventPayload(onLocalUserFollowed, 'to', 'user'),
        action: EnumFollowActions.OnFollowed,
      },
      {
        fn: convertEventPayload(onUserFollowed, 'to', 'user'),
        action: EnumFollowActions.OnFollowed,
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.BlockedUserLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(id => pullFromCache<Amity.InternalUser>(['user', 'get', id])!)
        .filter(isNonNullable)
        .map(({ data }) => data)
        .map(LinkedObject.user) ?? [],
    );
    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  applyFilter(data: Amity.InternalUser[]) {
    let users = data;

    users = users.filter(user => user.isDeleted == null || user.isDeleted === false);

    return users;
  }
}
