import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { UserPaginationController } from './UserPaginationController';
import { UserQueryStreamController } from './UserQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onUserDeleted,
  onUserFlagCleared,
  onUserFlagged,
  onUserUnflagged,
  onUserUpdated,
} from '~/userRepository/events';
import { sortByDisplayName, sortByFirstCreated, sortByLastCreated } from '~/core/query';
import { prepareUserPayload } from '~/userRepository/utils/prepareUserPayload';
import { EnumUserActions } from '~/userRepository/observers/enums';
import { isNonNullable } from '~/utils';
import { LinkedObject } from '~/utils/linkedObject';

export class UserLiveCollectionController extends LiveCollectionController<
  'user',
  Amity.UserLiveCollection,
  Amity.User,
  UserPaginationController
> {
  private queryStreamController: UserQueryStreamController;

  private query: Amity.UserLiveCollection;

  constructor(query: Amity.UserLiveCollection, callback: Amity.LiveCollectionCallback<Amity.User>) {
    const queryStreamId = hash(query);
    const cacheKey = ['user', 'collection', queryStreamId];
    const paginationController = new UserPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new UserQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareUserPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.UserLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.UserPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'user'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onUserDeleted, action: EnumUserActions.OnUserDeleted },
      { fn: onUserUpdated, action: EnumUserActions.OnUserUpdated },
      { fn: onUserFlagged, action: EnumUserActions.OnUserFlagged },
      { fn: onUserUnflagged, action: EnumUserActions.OnUserUnflagged },
      { fn: onUserFlagCleared, action: EnumUserActions.OnUserFlagCleared },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.UserLiveCollectionCache>(this.cacheKey)?.data;
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

  applyFilter(data: Amity.InternalUser[]) {
    let users = data;

    const sortFn = (() => {
      switch (this.query.sortBy) {
        case 'firstCreated':
          return sortByFirstCreated;
        case 'lastCreated':
          return sortByLastCreated;
        default:
          return sortByLastCreated;
      }
    })();

    users = users.sort(sortFn);

    if (this.query.filter === 'flagged') {
      users = users.filter(user => !!user.hashFlag);
    }

    users = users.filter(user => user.isDeleted == null || user.isDeleted === false);

    return users;
  }
}
