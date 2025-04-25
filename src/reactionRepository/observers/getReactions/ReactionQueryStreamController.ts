import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';

export class ReactionQueryStreamController extends QueryStreamController<
  Amity.ReactionPayload,
  Amity.ReactionLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.ReactionPayload) => Amity.ReactionPayload;

  constructor(
    query: Amity.ReactionLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.ReactionPayload) => Amity.ReactionPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.ReactionPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      const { reactions, ...restPayload } = processedPayload;
      ingestInCache(
        {
          ...restPayload,
          reactions,
          reactors: reactions[0]?.reactors,
        },
        { cachedAt },
      );
    }
  }

  appendToQueryStream(
    response: Amity.ReactionPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    const reactors = response.reactions[0]?.reactors ?? [];

    if (refresh) {
      pushToCache(this.cacheKey, {
        data: reactors.map(getResolver('reactor')),
      });
    } else {
      const collection = pullFromCache<Amity.ReactionLiveCollectionCache>(this.cacheKey)?.data;

      const reactions = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...reactions, ...reactors.map(getResolver('reactor'))])],
      });
    }
  }

  reactor(action: Amity.ReactionActionTypeEnum) {
    return (reaction: Amity.InternalReactor) => {
      const collection = pullFromCache<Amity.ReactionLiveCollectionCache>(this.cacheKey)?.data;
      if (!collection) return;

      if (action === Amity.ReactionActionTypeEnum.OnAdded) {
        collection.data = [...new Set([reaction.reactionId, ...collection.data])];
      } else if (action === Amity.ReactionActionTypeEnum.OnRemoved) {
        collection.data = collection.data.filter(p => p !== reaction.reactionId);
      }

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (reaction: Amity.InternalReactor) => void) => Amity.Unsubscriber;
      action: Amity.ReactionActionTypeEnum;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
