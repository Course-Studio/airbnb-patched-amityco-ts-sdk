import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { FollowingPaginationController } from './FollowingPaginationController';
import { FollowingQueryStreamController } from './FollowingQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';
import { isNonNullable } from '~/utils';
import {
  onFollowerDeleted,
  onFollowerRequested,
  onFollowRequestAccepted,
  onFollowRequestCanceled,
  onFollowRequestDeclined,
  onLocalFollowerRequested,
  onLocalFollowRequestAccepted,
  onLocalFollowRequestDeclined,
  onLocalUserFollowed,
  onLocalUserUnfollowed,
  onUserFollowed,
  onUserUnfollowed,
} from '../../events';
import { prepareFollowingsPayload } from '../../utils';
import { onFollowingUserDeleted } from '../../events/onFollowingUserDeleted';

export class FollowingLiveCollectionController extends LiveCollectionController<
  'following',
  Amity.FollowingLiveCollection,
  Amity.FollowStatus,
  FollowingPaginationController
> {
  private queryStreamController: FollowingQueryStreamController;

  private query: Amity.FollowingLiveCollection;

  constructor(
    query: Amity.FollowingLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.FollowStatus>,
  ) {
    const queryStreamId = hash({ ...query, type: 'following' });
    const cacheKey = ['follow', 'collection', queryStreamId];
    const paginationController = new FollowingPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new FollowingQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareFollowingsPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.FollowingLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.FollowingsPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'following'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onFollowerRequested, action: EnumFollowActions.OnRequested },
      { fn: onFollowRequestAccepted, action: EnumFollowActions.OnAccepted },
      { fn: onFollowRequestDeclined, action: EnumFollowActions.OnDeclined },
      { fn: onFollowRequestCanceled, action: EnumFollowActions.OnCanceled },
      { fn: onUserFollowed, action: EnumFollowActions.OnFollowed },
      { fn: onUserUnfollowed, action: EnumFollowActions.OnUnfollowed },
      { fn: onFollowerDeleted, action: EnumFollowActions.OnDeleted },
      { fn: onLocalFollowerRequested, action: EnumFollowActions.OnRequested },
      { fn: onLocalFollowRequestAccepted, action: EnumFollowActions.OnAccepted },
      { fn: onLocalFollowRequestDeclined, action: EnumFollowActions.OnDeclined },
      { fn: onLocalUserFollowed, action: EnumFollowActions.OnFollowed },
      { fn: onLocalUserUnfollowed, action: EnumFollowActions.OnUnfollowed },
      {
        fn: onFollowingUserDeleted({ userId: this.query.userId }),
        action: EnumFollowActions.OnUserDeleted,
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.FollowingLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(id => pullFromCache<Amity.InternalFollowStatus>(['follow', 'get', id])!)
        .filter(isNonNullable)
        .map(({ data }) => data) ?? [],
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

  applyFilter(data: Amity.InternalFollowStatus[]) {
    let followings = data;

    if (this.query.status && this.query.status !== Amity.FollowStatusTypeEnum.All) {
      followings = followings.filter(following => following.status === this.query.status);
    }

    followings = followings.filter(following => {
      const toUser = pullFromCache<Amity.InternalUser>(['user', 'get', following.to])?.data;
      return toUser?.isDeleted == null || toUser?.isDeleted === false;
    });

    return followings;
  }
}
