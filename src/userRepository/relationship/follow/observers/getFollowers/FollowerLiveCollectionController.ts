import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { FollowerPaginationController } from './FollowerPaginationController';
import { FollowerQueryStreamController } from './FollowerQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';
import { isNonNullable } from '~/utils';
import {
  onFollowerDeleted,
  onFollowRequestAccepted,
  onFollowRequestCanceled,
  onFollowRequestDeclined,
  onLocalFollowRequestAccepted,
  onLocalFollowRequestDeclined,
  onLocalUserFollowed,
  onLocalUserUnfollowed,
  onUserFollowed,
  onUserUnfollowed,
} from '../../events';
import { prepareFollowersPayload } from '../../utils';
import { onFollowerUserDeleted } from '../../events/onFollowerUserDeleted';

export class FollowerLiveCollectionController extends LiveCollectionController<
  'follower',
  Amity.FollowerLiveCollection,
  Amity.FollowStatus,
  FollowerPaginationController
> {
  private queryStreamController: FollowerQueryStreamController;

  private query: Amity.FollowerLiveCollection;

  constructor(
    query: Amity.FollowerLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.FollowStatus>,
  ) {
    const queryStreamId = hash({ ...query, type: 'follower' });
    const cacheKey = ['follow', 'collection', queryStreamId];
    const paginationController = new FollowerPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new FollowerQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareFollowersPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.FollowerLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.FollowersPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'follower'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onUserFollowed, action: EnumFollowActions.OnFollowed },
      { fn: onUserUnfollowed, action: EnumFollowActions.OnUnfollowed },
      { fn: onFollowRequestAccepted, action: EnumFollowActions.OnAccepted },
      { fn: onFollowRequestDeclined, action: EnumFollowActions.OnDeclined },
      { fn: onFollowRequestCanceled, action: EnumFollowActions.OnCanceled },
      { fn: onFollowerDeleted, action: EnumFollowActions.OnDeleted },
      { fn: onLocalFollowRequestAccepted, action: EnumFollowActions.OnAccepted },
      { fn: onLocalFollowRequestDeclined, action: EnumFollowActions.OnDeclined },
      { fn: onLocalUserFollowed, action: EnumFollowActions.OnFollowed },
      { fn: onLocalUserUnfollowed, action: EnumFollowActions.OnUnfollowed },
      {
        fn: onFollowerUserDeleted({ userId: this.query.userId }),
        action: EnumFollowActions.OnUserDeleted,
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.FollowerLiveCollectionCache>(this.cacheKey)?.data;
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
    let followers = data;

    if (this.query.status && this.query.status !== Amity.FollowStatusTypeEnum.All) {
      followers = followers.filter(follower => follower.status === this.query.status);
    }

    followers = followers.filter(follower => {
      const fromUser = pullFromCache<Amity.InternalUser>(['user', 'get', follower.from])?.data;
      return fromUser?.isDeleted == null || fromUser?.isDeleted === false;
    });

    return followers;
  }
}
