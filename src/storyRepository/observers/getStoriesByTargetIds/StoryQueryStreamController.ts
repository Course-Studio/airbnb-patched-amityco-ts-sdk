import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { getActiveClient } from '~/client';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { updateLocalLastStoryExpires } from '~/storyRepository/utils/updateLocalLastStoryExpires';
import { mappingStoryIdToReferenceId } from '~/storyRepository/utils/mappingStoryIdToReferenceId';
import { convertRawStoryToInternal } from '~/storyRepository/utils/convertRawToStory';
import { StoryPaginationNoPageController } from './StoryPaginationNoPageController';

export class StoryQueryStreamController extends QueryStreamController<
  Amity.StoryPayload,
  Amity.StoryLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private paginationController: StoryPaginationNoPageController;

  constructor(
    query: Amity.StoryLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    paginationController: StoryPaginationNoPageController,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.paginationController = paginationController;
  }

  // eslint-disable-next-line class-methods-use-this
  saveToMainDB(response: Amity.StoryPayload) {
    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    const convertedData: Amity.StoryPayload = convertRawStoryToInternal(response);

    if (client.cache) {
      ingestInCache(convertedData, { cachedAt });

      // Update local last story expires
      updateLocalLastStoryExpires(convertedData.stories);

      // Map storyId to referenceId
      mappingStoryIdToReferenceId(convertedData.stories);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getStoryReferenceIds(story: Amity.RawStory) {
    if (story?.referenceId) {
      return story.referenceId;
    }
    return story.storyId;
  }

  appendToQueryStream(
    response: Amity.StoryPayload,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.stories.map(this.getStoryReferenceIds),
      });
    } else {
      const collection = pullFromCache<Amity.StoryLiveCollectionCache>(this.cacheKey)?.data;
      const stories = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...stories, ...response.stories.map(this.getStoryReferenceIds)])],
      });
    }
  }

  reactor(action: Amity.StoryActionType) {
    return (payload: Amity.InternalStory[]) => {
      const collection = pullFromCache<Amity.StoryLiveCollectionCache>(this.cacheKey)?.data;
      if (!collection) return;

      const newReferenceIds = payload.map(({ referenceId }) => referenceId);

      collection.data = [...new Set([...newReferenceIds, ...collection.data])];
      pushToCache(this.cacheKey, collection);

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
