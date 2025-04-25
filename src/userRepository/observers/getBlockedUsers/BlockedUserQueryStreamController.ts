import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumUserActions } from '../enums';
import { EnumFollowActions } from '~/userRepository/relationship/follow/enums';

export class BlockedUserQueryStreamController extends QueryStreamController<
  Amity.BlockedUserPayload,
  Amity.BlockedUsersLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.BlockedUserPayload) => Amity.ProcessedBlockedUserPayload;

  constructor(
    query: Amity.BlockedUsersLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.BlockedUserPayload) => Amity.ProcessedBlockedUserPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.BlockedUserPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.BlockedUserPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.users.map(getResolver('user')),
      });
    } else {
      const collection = pullFromCache<Amity.BlockedUserLiveCollectionCache>(this.cacheKey)?.data;

      const users = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...users, ...response.users.map(getResolver('user'))])],
      });
    }
  }

  reactor(action: EnumUserActions | EnumFollowActions) {
    return (targetUser: Amity.InternalUser) => {
      if (action === EnumFollowActions.OnFollowed) {
        const collection = pullFromCache<Amity.BlockedUserLiveCollectionCache>(this.cacheKey)?.data;
        const updatedCollection = collection?.data.filter(id => id !== targetUser.userId);

        pushToCache(this.cacheKey, {
          ...collection,
          data: updatedCollection,
        });
      }

      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (user: Amity.InternalUser) => void) => Amity.Unsubscriber;
      action: EnumUserActions | EnumFollowActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
