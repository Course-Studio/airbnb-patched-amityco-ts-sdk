import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumUserActions } from '~/userRepository/observers/enums';

export class UserQueryStreamController extends QueryStreamController<
  Amity.UserPayload,
  Amity.UserLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.UserPayload) => Amity.ProcessedUserPayload;

  constructor(
    query: Amity.UserLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.UserPayload) => Amity.ProcessedUserPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.UserPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.UserPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.users.map(getResolver('user')),
      });
    } else {
      const collection = pullFromCache<Amity.UserLiveCollectionCache>(this.cacheKey)?.data;

      const users = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...users, ...response.users.map(getResolver('user'))])],
      });
    }
  }

  reactor(action: EnumUserActions) {
    return (user: Amity.InternalUser) => {
      const collection = pullFromCache<Amity.UserLiveCollectionCache>(this.cacheKey)?.data;
      if (!collection) return;

      /*
       * Simply update a collection and let responder decide what to do with data
       */
      collection.data = [...new Set([user.userId, ...collection.data])];

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (user: Amity.InternalUser) => void) => Amity.Unsubscriber;
      action: EnumUserActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
