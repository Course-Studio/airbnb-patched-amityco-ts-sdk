import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { getActiveClient } from '~/client';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { GlobalStoryPageController } from './GlobalStoryPageController';

const updateLocalList = (cacheKey: string[], targetIds: Amity.StoryTarget['targetId'][]) => {
  const collection = pullFromCache<Amity.StoryLiveCollectionCache>(cacheKey)?.data;
  const storyTargets = collection?.data ?? [];

  pushToCache(cacheKey, {
    ...collection,
    data: [...new Set([...storyTargets, ...targetIds])],
  });
};

export class GlobalStoryQueryStreamController extends QueryStreamController<
  Amity.GlobalStoryFeedPayload,
  Amity.LiveCollectionParams<Amity.StoryGlobalQuery>
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.GlobalStoryFeedPayload,
  ) => Amity.ProcessedGlobalStoryFeed;

  private paginationController: GlobalStoryPageController;

  constructor(
    query: Amity.LiveCollectionParams<Amity.StoryGlobalQuery>,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    paginationController: GlobalStoryPageController,
    preparePayload: (response: Amity.GlobalStoryFeedPayload) => Amity.ProcessedGlobalStoryFeed,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.paginationController = paginationController;

    // Fix ESLint, "Expected 'this' to be used by class method"
    this.preparePayload = preparePayload;
  }

  saveToMainDB(response: Amity.GlobalStoryFeedPayload) {
    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    // Fix Eslint error for "Expected 'this' to be used by class method"
    const data = this.preparePayload(response);

    if (client.cache) {
      ingestInCache(data, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.GlobalStoryFeedPayload,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.storyTargets.map(({ targetId }) => targetId),
      });
    } else {
      updateLocalList(
        this.cacheKey,
        response.storyTargets.map(({ targetId }) => targetId),
      );
    }
  }

  reactor(actionType: Amity.StoryActionType) {
    return (payload: Amity.InternalStory[]) => {
      if (
        actionType === Amity.StoryActionType.OnCreate &&
        this.query.seenState !== Amity.StorySeenQuery.SEEN
      ) {
        updateLocalList(
          this.cacheKey,
          payload.map(({ targetId }) => targetId),
        );
      }

      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: Amity.Listener<Amity.InternalStory[]>) => Amity.Unsubscriber;
      action: Amity.StoryActionType;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
