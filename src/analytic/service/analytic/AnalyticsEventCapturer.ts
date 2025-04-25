import { upsertInCache } from '~/cache/api/upsertInCache';
import { pullFromCache } from '~/cache/api/pullFromCache';
import { DAY, MINUTE } from '~/utils/constants';
import { dropFromCache, pushToCache } from '~/cache/api';
import { fireEvent } from '~/core/events';
import { STORY_KEY_CACHE } from '~/storyRepository/constants';
import { ANALYTIC_CACHE_KEY, HIGH_PRIORITY_ANALYTIC_CACHE_KEY } from '../../constant';

export class AnalyticsEventCapturer {
  _expireTime = 5 * MINUTE;

  _poolLimit = 1000;

  _recentViewed: { [key: Amity.InternalPost['postId']]: Date } = {};

  _recentHighPriorityViewed: { [key: Amity.InternalStory['storyId']]: Date } = {};

  // Story
  _throttleStoryTimer: NodeJS.Timeout | undefined = undefined;

  _bufferNewSeenStoryReferenceIds: Amity.Story['referenceId'][] = [];

  isAbleToEnqueue({
    uniqueId,
    expireTime,
    isHighPriority = false,
  }: {
    uniqueId: string;
    expireTime: number;
    isHighPriority?: boolean;
  }) {
    const now = new Date();

    // Get the recent view date (if any)
    const recentViewedDate = isHighPriority
      ? this._recentHighPriorityViewed[uniqueId]
      : this._recentViewed[uniqueId];

    // If this is the first view, always allow it
    if (!recentViewedDate) {
      return true;
    }

    const timeDiff = now.getTime() - recentViewedDate.getTime();

    if (timeDiff < expireTime) {
      // just recently view this post, ignore the event.
      return false;
    }

    return true;
  }

  markAs({
    uniqueId,
    contentId,
    contentType,
    activityType,
    metadata,
  }: {
    uniqueId: string;
    contentId: string;
    contentType: Amity.AnalyticEventContentType;
    activityType: Amity.AnalyticEventActivityType;
    metadata?: Record<string, string>;
  }) {
    if (!this.isAbleToEnqueue({ uniqueId, expireTime: this._expireTime })) return;

    const now = new Date();

    const currentData: { event: Amity.AnalyticEventModel[] } = { event: [] };
    const cache = pullFromCache<{ event: Amity.AnalyticEventModel[] }>(ANALYTIC_CACHE_KEY);

    if (cache?.data) {
      currentData.event = cache.data.event;
    }

    // If the pool is full (Max 1000 items), remove the oldest data
    if (currentData.event.length >= this._poolLimit) {
      // Remove oldest data
      currentData.event.shift();
    }

    const analyticItem: Amity.AnalyticEventModel = {
      contentId,
      contentType,
      activityType,
      timestamp: now.toISOString(),
    };

    if (metadata) {
      analyticItem.metadata = metadata;
    }

    currentData.event.push(analyticItem);

    upsertInCache(ANALYTIC_CACHE_KEY, currentData);
    this._recentViewed[uniqueId] = now;
  }

  markPostAsViewed(postId: Amity.InternalPost['postId']) {
    this.markAs({
      uniqueId: postId,
      contentId: postId,
      contentType: Amity.AnalyticEventContentType.Post,
      activityType: Amity.AnalyticEventActivityType.View,
    });
  }

  markStory(story: Amity.InternalStory, activityType: Amity.AnalyticEventActivityType) {
    if (!story.expiresAt) return;
    const now = new Date();
    const expireTime = new Date(story.expiresAt);

    if (
      !this.isAbleToEnqueue({
        uniqueId: story.storyId,
        expireTime: expireTime.getTime(),
        isHighPriority: true,
      })
    )
      return;

    const currentData: { event: Amity.AnalyticEventModel[] } = { event: [] };

    const cache = pullFromCache<{ event: Amity.AnalyticEventModel[] }>(
      HIGH_PRIORITY_ANALYTIC_CACHE_KEY,
    );

    if (cache?.data) {
      currentData.event = cache.data.event;
    }

    // If the pool is full (Max 1000 items), remove the oldest data
    if (currentData.event.length >= this._poolLimit) {
      // Remove oldest data
      currentData.event.shift();
    }

    currentData.event.push({
      contentId: story.storyId,
      contentType: Amity.AnalyticEventContentType.Story,
      activityType,
      timestamp: now.toISOString(),
    });

    upsertInCache(HIGH_PRIORITY_ANALYTIC_CACHE_KEY, currentData);
    this._recentHighPriorityViewed[story.storyId] = now;

    // Fire internal event if the activity type is not click
    if (activityType === Amity.AnalyticEventActivityType.Click) return;

    // Mark story as SEEN
    pushToCache([STORY_KEY_CACHE.IS_SEEN, 'get', story.storyId], new Date().toISOString());

    // Update the latest timestamp for LocalStoryLastSeen
    const currentLastSeen = pullFromCache<Amity.timestamp>([
      STORY_KEY_CACHE.LAST_SEEN,
      story.targetId,
    ]);

    if (currentLastSeen?.data) {
      if (new Date(currentLastSeen.data).getTime() < new Date(story.expiresAt).getTime()) {
        pushToCache([STORY_KEY_CACHE.LAST_SEEN, story.targetId], story.expiresAt);
      }
    } else {
      pushToCache([STORY_KEY_CACHE.LAST_SEEN, story.targetId], story.expiresAt);
    }

    this._bufferNewSeenStoryReferenceIds.push(story.referenceId);

    if (this._throttleStoryTimer) return;

    this._throttleStoryTimer = setTimeout(() => {
      clearTimeout(this._throttleStoryTimer);
      fireEvent('local.story.reload', { referenceIds: this._bufferNewSeenStoryReferenceIds });
      this._bufferNewSeenStoryReferenceIds = [];
    }, 300);
  }

  resetAllBuckets() {
    this._recentViewed = {};
    this._recentHighPriorityViewed = {};

    dropFromCache(ANALYTIC_CACHE_KEY);
    dropFromCache(HIGH_PRIORITY_ANALYTIC_CACHE_KEY);
  }

  markStoryAsViewed(story: Amity.InternalStory) {
    this.markStory(story, Amity.AnalyticEventActivityType.View);
  }

  markStoryAsClicked(story: Amity.InternalStory) {
    this.markStory(story, Amity.AnalyticEventActivityType.Click);
  }

  markAdAsViewed(ad: Amity.InternalAd, placement: Amity.AdPlacement) {
    const metadata = {
      placement,
    };

    const activityType = Amity.AnalyticEventActivityType.View;

    this.markAs({
      uniqueId: `${ad.adId}.${activityType}.${placement}`,
      contentId: ad.adId,
      contentType: Amity.AnalyticEventContentType.Ad,
      activityType,
      metadata,
    });
  }

  markAdAsClicked(ad: Amity.InternalAd, placement: Amity.AdPlacement) {
    const metadata = {
      placement,
    };

    const activityType = Amity.AnalyticEventActivityType.Click;

    this.markAs({
      uniqueId: `${ad.adId}.${activityType}.${placement}`,
      contentId: ad.adId,
      contentType: Amity.AnalyticEventContentType.Ad,
      activityType,
      metadata,
    });
  }
}
