import hash from 'object-hash';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { pullFromCache, pushToCache, queryCache } from '~/cache/api';
import { LinkedObject } from '~/utils/linkedObject';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { sortByLocalSortingDate } from '~/core/query';
import { onStoryCreated, onStoryCreatedLocal } from '~/storyRepository/events/onStoryCreated';
import { onStoryUpdated, onStoryUpdatedLocal } from '~/storyRepository/events/onStoryUpdated';
import { onStoryDeleted, onStoryDeletedLocal } from '~/storyRepository/events/onStoryDeleted';
import { onStoryError } from '~/storyRepository/events/onStoryError';
import { GlobalStoryQueryStreamController } from './GlobalStoryQueryStreamController';
import { GlobalStoryPageController } from './GlobalStoryPageController';
import { prepareCommunityPayload } from '~/communityRepository/utils';

type StoryTargetBySeenState = {
  seen: Amity.StoryTarget[];
  unseen: Amity.StoryTarget[];
  unknown: Amity.StoryTarget[];
};

export class GlobalStoryLiveCollectionController extends LiveCollectionController<
  'globalStoryFeed',
  Amity.StoryGlobalQuery,
  Amity.StoryTarget,
  GlobalStoryPageController
> {
  private queryStreamController: GlobalStoryQueryStreamController;

  private query: Amity.StoryGlobalQuery;

  constructor(
    query: Amity.StoryGlobalQuery,
    callback: Amity.LiveCollectionCallback<Amity.StoryTarget>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = [STORY_KEY_CACHE.STORY_GLOBAL_FEED, 'collection', queryStreamId];
    const paginationController = new GlobalStoryPageController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;

    this.queryStreamController = new GlobalStoryQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      paginationController,
      (data: Amity.GlobalStoryFeedPayload) => {
        const { feeds, ...rest } = prepareCommunityPayload({ ...data, feeds: [] });
        return { ...data, ...rest };
      },
    );

    this.paginationController = paginationController;
    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.StoryTargetLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected persistModel(response: Amity.GlobalStoryFeedPayload) {
    this.queryStreamController.saveToMainDB(response);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'globalStoryFeed'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.StoryTargetLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const targetIds = collection.data;

    const cachedTargets = queryCache<Amity.RawStoryTarget>([STORY_KEY_CACHE.STORY_TARGET]);

    if (cachedTargets && cachedTargets?.length > 0) {
      cachedTargets?.forEach(({ key }) => {
        if (!collection.data.includes(key[2] as string)) targetIds.push(key[2] as string);
      });
    }

    let data = targetIds
      .map(
        targetId =>
          pullFromCache<Amity.RawStoryTarget>([STORY_KEY_CACHE.STORY_TARGET, 'get', targetId])!,
      )
      .filter(Boolean)
      .map(storyTarget => LinkedObject.storyTarget(storyTarget.data));

    if (!this.shouldNotify(data) && origin === 'event') return;

    data = this.applyFilter(data)
      // exclude story targets with invalid stories
      .filter(({ localSortingDate }) => !!localSortingDate)
      // Remove internal fields
      .map(
        ({ localFilter, localLastExpires, localLastSeen, localSortingDate, ...rest }) => rest,
      ) as Amity.StoryTarget[];

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }

  private applyFilter(data: Amity.StoryTarget[]): Amity.StoryTarget[] {
    if (this.query.seenState !== Amity.StorySeenQuery.SMART) {
      return data
        .filter(({ hasUnseen }) => {
          if (this.query.seenState === Amity.StorySeenQuery.ALL) return true;
          if (this.query.seenState === Amity.StorySeenQuery.SEEN && !hasUnseen) return true;
          return this.query.seenState === Amity.StorySeenQuery.UNSEEN && hasUnseen;
        })
        .sort(sortByLocalSortingDate);
    }

    // Smart Filter - Apply local sorting on each list of data
    const result = data.reduce<StoryTargetBySeenState>(
      (acc, storyTarget) => {
        if (storyTarget.localFilter === Amity.StorySeenQuery.UNSEEN) {
          acc.unseen.push(storyTarget);
        } else if (storyTarget.localFilter === Amity.StorySeenQuery.SEEN) {
          acc.seen.push(storyTarget);
        } else {
          acc.unknown.push(storyTarget);
        }
        return acc;
      },
      { unseen: [], seen: [], unknown: [] },
    );

    const sortedUnknown = result.unknown.sort(sortByLocalSortingDate) || [];
    const sortedUnseen = result.unseen.sort(sortByLocalSortingDate) || [];
    const sortedSeen = result.seen.sort(sortByLocalSortingDate) || [];

    // Merge all status and remove internal fields
    return sortedUnknown.concat(sortedUnseen, sortedSeen);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onStoryCreated, action: Amity.StoryActionType.OnCreate },
      { fn: onStoryUpdated, action: Amity.StoryActionType.OnUpdate },
      { fn: onStoryDeleted, action: Amity.StoryActionType.OnDelete },

      { fn: onStoryCreatedLocal, action: Amity.StoryActionType.OnCreate },
      { fn: onStoryUpdatedLocal, action: Amity.StoryActionType.OnUpdate },
      { fn: onStoryDeletedLocal, action: Amity.StoryActionType.OnDelete },

      { fn: onStoryError, action: Amity.StoryActionType.OnError },
    ]);
  }
}
