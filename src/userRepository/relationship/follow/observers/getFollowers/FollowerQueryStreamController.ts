import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';

export class FollowerQueryStreamController extends QueryStreamController<
  Amity.FollowersPayload,
  Amity.FollowerLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.FollowersPayload) => Amity.ProcessedFollowersPayload;

  constructor(
    query: Amity.FollowerLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.FollowersPayload) => Amity.ProcessedFollowersPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.FollowersPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.FollowersPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.follows.map(getResolver('follow')),
      });
    } else {
      const collection = pullFromCache<Amity.FollowerLiveCollectionCache>(this.cacheKey)?.data;

      const follows = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...follows, ...response.follows.map(getResolver('follow'))])],
      });
    }
  }

  reactor(action: EnumFollowActions) {
    return (followStatus: Amity.InternalFollowStatus) => {
      const collection = pullFromCache<Amity.FollowerLiveCollectionCache>(this.cacheKey)?.data;

      if (this.query.userId !== followStatus.to || !collection) return;

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
      fn: (reactor: (followStatus: Amity.InternalFollowStatus) => void) => Amity.Unsubscriber;
      action: EnumFollowActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
