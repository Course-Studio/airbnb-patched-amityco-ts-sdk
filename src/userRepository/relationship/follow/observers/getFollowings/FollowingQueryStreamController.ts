import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';

export class FollowingQueryStreamController extends QueryStreamController<
  Amity.FollowingsPayload,
  Amity.FollowingLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.FollowingsPayload) => Amity.ProcessedFollowingsPayload;

  constructor(
    query: Amity.FollowingLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.FollowingsPayload) => Amity.ProcessedFollowingsPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.FollowingsPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.FollowingsPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.follows.map(getResolver('follow')),
      });
    } else {
      const collection = pullFromCache<Amity.FollowingLiveCollectionCache>(this.cacheKey)?.data;

      const follows = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...follows, ...response.follows.map(getResolver('follow'))])],
      });
    }
  }

  reactor(action: EnumFollowActions) {
    return (followStatus: Amity.InternalFollowStatus) => {
      const collection = pullFromCache<Amity.FollowingLiveCollectionCache>(this.cacheKey)?.data;

      if (this.query.userId !== followStatus.from || !collection) return;

      switch (action) {
        case EnumFollowActions.OnDeclined:
        case EnumFollowActions.OnCanceled:
        case EnumFollowActions.OnUnfollowed:
        case EnumFollowActions.OnDeleted:
          collection.data = collection.data.filter(p => p !== getResolver('follow')(followStatus));
          break;
        case EnumFollowActions.OnRequested:
        case EnumFollowActions.OnAccepted:
        case EnumFollowActions.OnFollowed:
          collection.data = [...new Set([getResolver('follow')(followStatus), ...collection.data])];
          break;

        default:
          break;
      }

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (user: Amity.InternalFollowStatus) => void) => Amity.Unsubscriber;
      action: EnumFollowActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
