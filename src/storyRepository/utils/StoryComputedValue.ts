import { pullFromCache, queryCache } from '~/cache/api';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';

export class StoryComputedValue {
  private readonly _targetId: string;

  private readonly _lastStoryExpiresAt?: Amity.timestamp;

  private readonly _lastStorySeenExpiresAt?: Amity.timestamp;

  private cacheStoryExpireTime?: Amity.Cached<Amity.timestamp>;

  private cacheStoreSeenTime?: Amity.Cached<Amity.timestamp>;

  private _syncingStoriesCount = 0;

  private _errorStoriesCount = 0;

  constructor(
    targetId: string,
    lastStoryExpiresAt?: Amity.timestamp,
    lastStorySeenExpiresAt?: Amity.timestamp,
  ) {
    this._targetId = targetId;

    this._lastStoryExpiresAt = lastStoryExpiresAt;

    this._lastStorySeenExpiresAt = lastStorySeenExpiresAt;

    this.cacheStoryExpireTime = pullFromCache<Amity.timestamp>([
      STORY_KEY_CACHE.EXPIRE,
      this._targetId,
    ]);

    this.cacheStoreSeenTime = pullFromCache<Amity.timestamp>([
      STORY_KEY_CACHE.LAST_SEEN,
      this._targetId,
    ]);

    this.getTotalStoryByStatus();
  }

  get lastStoryExpiresAt(): number {
    return this._lastStoryExpiresAt ? new Date(this._lastStoryExpiresAt).getTime() : 0;
  }

  get lastStorySeenExpiresAt(): number {
    return this._lastStorySeenExpiresAt ? new Date(this._lastStorySeenExpiresAt).getTime() : 0;
  }

  get localLastStoryExpires(): number {
    return this.cacheStoryExpireTime?.data
      ? new Date(this.cacheStoryExpireTime?.data).getTime()
      : 0;
  }

  get localLastStorySeenExpiresAt(): number {
    return this.cacheStoreSeenTime?.data ? new Date(this.cacheStoreSeenTime?.data).getTime() : 0;
  }

  get isContainUnSyncedStory(): boolean {
    const currentSyncingState = pullFromCache<Amity.SyncState>([
      STORY_KEY_CACHE.SYNC_STATE,
      this._targetId,
    ]);

    if (!currentSyncingState?.data) return false;

    return [Amity.SyncState.Syncing, Amity.SyncState.Error].includes(currentSyncingState.data);
  }

  getLocalLastSortingDate(): number {
    if (this.isContainUnSyncedStory) {
      return this.localLastStoryExpires;
    }

    return this.lastStoryExpiresAt;
  }

  getHasUnseenFlag(): boolean {
    const now = new Date().getTime();

    const highestSeen = Math.max(this.lastStorySeenExpiresAt, this.localLastStorySeenExpiresAt);

    const currentSyncingState = pullFromCache<Amity.SyncState>([
      STORY_KEY_CACHE.SYNC_STATE,
      this._targetId,
    ]);

    if (this.isContainUnSyncedStory) {
      return this.localLastStoryExpires > now && this.localLastStoryExpires > highestSeen;
    }

    return this.lastStoryExpiresAt > now && this.lastStoryExpiresAt > highestSeen;
  }

  getTotalStoryByStatus(): void {
    const stories = queryCache<Amity.InternalStory>([STORY_KEY_CACHE.STORY, 'get']);

    if (!stories) {
      this._errorStoriesCount = 0;
      this._syncingStoriesCount = 0;
      return;
    }

    const groupByType = stories.reduce(
      (acc, story) => {
        const {
          data: { targetId, syncState, isDeleted },
        } = story;

        if (targetId === this._targetId && !isDeleted) {
          acc[syncState!] += 1;
        }

        return acc;
      },
      {
        syncing: 0,
        error: 0,
        synced: 0,
      },
    );

    this._errorStoriesCount = groupByType.error;
    this._syncingStoriesCount = groupByType.syncing;
  }

  get syncingStoriesCount(): number {
    return this._syncingStoriesCount;
  }

  get failedStoriesCount(): number {
    return this._errorStoriesCount;
  }
}
