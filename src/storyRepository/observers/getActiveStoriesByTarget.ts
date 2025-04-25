import { getActiveClient } from '~/client';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache, pullFromCache, pushToCache, queryCache } from '~/cache/api';
import {
  createQuery,
  runQuery,
  sortByFirstCreated,
  sortByFirstUpdated,
  sortByLastCreated,
  sortByLastUpdated,
} from '~/core/query';
import { getResolver } from '~/core/model';
import { LinkedObject } from '~/utils/linkedObject';
import { onStoryUpdated, onStoryUpdatedLocal } from '~/storyRepository/events/onStoryUpdated';
import {
  onStoryReactionAdded,
  onStoryReactionAddedLocal,
} from '~/storyRepository/events/onStoryReactionAdded';
import {
  onStoryReactionRemoved,
  onStoryReactionRemovedLocal,
} from '~/storyRepository/events/onStoryReactionRemoved';
import { getStoryCache } from '../utils/getStoryCache';
import { getActiveStoriesByTarget as _getActiveStoriesByTarget } from '../internalApi/getActiveStoriesByTarget';
import { onStoryCreated, onStoryCreatedLocal } from '../events/onStoryCreated';
import { onStoryDeleted, onStoryDeletedLocal } from '../events/onStoryDeleted';
import { onStoryError } from '../events/onStoryError';
import { onStoryLocalDataUpdated } from '../events/onStoryLocalDataUpdated';
import { STORY_KEY_CACHE } from '../constants';

/**
 * ```js
 * import { StoryRepository } from '@amityco/js-sdk';
 * let storiesData;
 *
 * const unsubscribe = StoryRepository.getActiveStoriesByTarget({ targetId, targetType }, response => {
 *  storiesData = response.data;
 * });
 *
 * unsubscribe();
 * ```
 *
 * Observe all mutations on a given {@link Amity.Story}
 *
 * @param params for querying stories from a community
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the story
 *
 * @category SubChannel Live Object
 */
export const getActiveStoriesByTarget = (
  params: Amity.GetStoriesByTargetParam,
  callback: Amity.LiveCollectionCallback<Amity.Story | undefined>,
) => {
  const { log, cache } = getActiveClient();

  const disposers: Amity.Unsubscriber[] = [];
  const cacheKey = ['story-target', 'collection', params];

  const timestamp = Date.now();
  log(`getActiveStoriesByTarget(tmpid: ${timestamp}) > listen`);

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const storySorting = (story: Amity.Story[]): Amity.Story[] => {
    const sortBy = params.options?.sortBy || 'createdAt';
    const orderBy = params.options?.orderBy || 'desc';

    if (story.length === 0) return [];

    if (sortBy === 'createdAt') {
      return orderBy === 'asc' ? story.sort(sortByFirstCreated) : story.sort(sortByLastCreated);
    }

    return orderBy === 'asc' ? story.sort(sortByFirstUpdated) : story.sort(sortByLastUpdated);
  };

  const responder = (snapshot: Amity.StoryLiveCollectionCache) => {
    const stories = snapshot.data
      .map(referenceId => {
        const story = getStoryCache(referenceId);
        if (!story?.data) return undefined;
        return LinkedObject.story(story.data);
      })
      .filter(Boolean)
      // Remove all deleted stories
      .filter(item => {
        if (!item) return false;
        return !item.isDeleted;
      });

    const newStoryList: Amity.Story[] = [];

    if (stories.length > 0) {
      const storiesBySyncState = stories.reduce((acc, story) => {
        if (!story) return acc;
        const { syncState } = story;

        if (!syncState) return acc;

        let currentValue = acc.get(syncState);

        if (!currentValue) {
          currentValue = [];
        }

        currentValue.push(story);

        acc.set(syncState, currentValue);
        return acc;
      }, new Map<Amity.SyncState, Amity.Story[]>());

      if (storiesBySyncState.has(Amity.SyncState.Error)) {
        const errorStories = storySorting(storiesBySyncState.get(Amity.SyncState.Error) || []);
        newStoryList.push(...errorStories);
      }

      if (storiesBySyncState.has(Amity.SyncState.Syncing)) {
        const syncingStories = storySorting(storiesBySyncState.get(Amity.SyncState.Syncing) || []);
        newStoryList.push(...syncingStories);
      }

      if (storiesBySyncState.has(Amity.SyncState.Synced)) {
        const syncedStories = storySorting(storiesBySyncState.get(Amity.SyncState.Synced) || []);
        newStoryList.push(...syncedStories);
      }
    }

    callback({
      onNextPage: () => false,
      data: newStoryList || stories,
      hasNextPage: !!snapshot.params?.page,
      loading: snapshot.loading || false,
    });
  };

  const processNewData = (
    result: Amity.InternalStory[] | undefined,
    event: string,
    initial = false,
    loading = false,
    error = false,
  ) => {
    const cached = pullFromCache<Amity.InternalStory['referenceId'][]>(cacheKey);

    const data: Amity.StoryLiveCollectionCache = {
      loading,
      error,
      params: { page: undefined },
      data: cached?.data || [],
    };

    if (result) {
      if (event === Amity.StoryActionType.OnDelete) {
        const deletedIds = result.map(({ referenceId }) => referenceId);
        data.data = data.data.filter(refId => !deletedIds.includes(refId!)) || [];
      } else {
        data.data = initial
          ? result.map(getResolver('story'))
          : [...new Set([...data.data, ...result.map(getResolver('story'))])];
      }
    }

    const unSyncedStories = queryCache<Amity.InternalStory>([STORY_KEY_CACHE.STORY, 'get'])
      ?.filter(
        story =>
          story.data.targetId === params.targetId &&
          story.data.syncState !== Amity.SyncState.Synced,
      )
      .map(story => getResolver('story')(story.data));

    if (unSyncedStories && unSyncedStories?.length > 0) {
      unSyncedStories.forEach(referenceId => {
        if (!data.data.includes(referenceId)) data.data.push(referenceId);
      });
    }

    pushToCache(cacheKey, data.data);

    responder(data);
  };

  const realtimeRouter = (event: Amity.StoryActionType) => (story: Amity.InternalStory[]) => {
    processNewData(story, event);
  };

  const reloadData = () => (newData: { referenceIds: Amity.Story['referenceId'][] }) => {
    const cached = pullFromCache<Amity.InternalStory['referenceId'][]>(cacheKey);

    if (!cached) return;
    if (newData.referenceIds.length === 0 || cached?.data.length === 0) return;

    const shouldUpdate = cached?.data.find(referenceId =>
      newData.referenceIds.includes(referenceId),
    );

    if (!shouldUpdate) return;

    const data: Amity.StoryLiveCollectionCache = {
      loading: false,
      error: false,
      params: { page: undefined },
      data: cached?.data || [],
    };

    responder(data);
  };

  const onFetch = (initial: boolean) => {
    const query = createQuery(_getActiveStoriesByTarget, params);

    runQuery(query, ({ data: result, error, loading }) => {
      processNewData(result, 'fetch', initial, loading, error);
    });
  };

  onFetch(true);
  disposers.push(
    onStoryCreated(realtimeRouter(Amity.StoryActionType.OnCreate)),
    onStoryUpdated(realtimeRouter(Amity.StoryActionType.OnUpdate)),
    onStoryDeleted(realtimeRouter(Amity.StoryActionType.OnDelete)),
    onStoryReactionAdded(realtimeRouter(Amity.StoryActionType.OnReactionAdded)),
    onStoryReactionRemoved(realtimeRouter(Amity.StoryActionType.OnReactionRemoved)),
    onStoryError(realtimeRouter(Amity.StoryActionType.OnError)),

    onStoryCreatedLocal(realtimeRouter(Amity.StoryActionType.OnCreate)),
    onStoryUpdatedLocal(realtimeRouter(Amity.StoryActionType.OnUpdate)),
    onStoryDeletedLocal(realtimeRouter(Amity.StoryActionType.OnDelete)),
    onStoryReactionAddedLocal(realtimeRouter(Amity.StoryActionType.OnReactionAdded)),
    onStoryReactionRemovedLocal(realtimeRouter(Amity.StoryActionType.OnReactionRemoved)),

    onStoryLocalDataUpdated(reloadData()),
    () => dropFromCache(cacheKey),
  );

  return () => {
    log(`getActiveStoriesByTarget(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
