import hash from 'object-hash';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { LinkedObject } from '~/utils/linkedObject';
import { sortByFirstCreated, sortByLastCreated } from '~/core/query';
import { onStoryCreated } from '~/storyRepository/events/onStoryCreated';
import { onStoryUpdated } from '~/storyRepository/events/onStoryUpdated';
import { onStoryDeleted } from '~/storyRepository/events/onStoryDeleted';
import { onStoryError } from '~/storyRepository/events/onStoryError';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { StoryQueryStreamController } from './StoryQueryStreamController';
import { StoryPaginationNoPageController } from './StoryPaginationNoPageController';

export class StoryLiveCollectionController extends LiveCollectionController<
  'story',
  Amity.StoryLiveCollection,
  Amity.Story,
  StoryPaginationNoPageController
> {
  private queryStreamController: StoryQueryStreamController;

  private query: Amity.StoryLiveCollection;

  constructor(
    query: Amity.StoryLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Story>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = [STORY_KEY_CACHE.STORY_TARGET_IDS, 'collection', queryStreamId];
    const paginationController = new StoryPaginationNoPageController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;

    this.queryStreamController = new StoryQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      paginationController,
    );

    this.paginationController = paginationController;
    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.StoryLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected persistModel(response: Amity.StoryPayload) {
    this.queryStreamController.saveToMainDB(response);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'story'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.StoryLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    let data = collection.data
      .map(
        referenceId =>
          pullFromCache<Amity.InternalStory>([STORY_KEY_CACHE.STORY, 'get', referenceId])!, // Story use referenceId instead of storyId
      )
      .filter(Boolean)
      .map(internStory => LinkedObject.story(internStory.data));

    if (!this.shouldNotify(data) && origin === 'event') return;

    data = this.applyFilter(data);

    this.callback({
      onNextPage: undefined,
      data,
      hasNextPage: false,
      loading,
      error,
    });
  }

  private applyFilter(data: Amity.Story[]) {
    const internalStories = data;

    const orderBy = this.query?.options?.orderBy || 'desc';

    return orderBy === 'asc'
      ? internalStories.sort(sortByFirstCreated)
      : internalStories.sort(sortByLastCreated);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onStoryCreated, action: Amity.StoryActionType.OnCreate },
      { fn: onStoryUpdated, action: Amity.StoryActionType.OnUpdate },
      { fn: onStoryDeleted, action: Amity.StoryActionType.OnDelete },
      { fn: onStoryError, action: Amity.StoryActionType.OnError },
    ]);
  }
}
