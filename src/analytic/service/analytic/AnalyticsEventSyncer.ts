import { pullFromCache } from '~/cache/api/pullFromCache';
import { dropFromCache } from '~/cache/api/dropFromCache';
import { MINUTE, SECOND } from '~/utils/constants';
import { ANALYTIC_CACHE_KEY, HIGH_PRIORITY_ANALYTIC_CACHE_KEY } from '../../constant';
import { syncEvent } from '../../api/syncEvent';

export class AnalyticsEventSyncer {
  _timer: NodeJS.Timeout | undefined = undefined;

  _high_priority_timer: NodeJS.Timeout | undefined = undefined;

  start() {
    this.syncCapturedEvent();

    this._timer = setInterval(() => {
      this.syncCapturedEvent();
    }, 1 * MINUTE);

    this._high_priority_timer = setInterval(() => {
      this.syncHighPriorityCapturedEvent();
    }, 10 * SECOND);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = undefined;
    }

    if (this._high_priority_timer) {
      clearInterval(this._high_priority_timer);
      this._high_priority_timer = undefined;
    }
  }

  async syncCapturedEvent() {
    try {
      // Must query only objects that have same userId with current logged-in user.
      // Query captured event with maximum of 1000
      // Order by latest first
      // e.g., If there are 2000 events we will query 1000-2000 first
      const cache = pullFromCache<{ event: Amity.AnalyticEventModel[] }>(ANALYTIC_CACHE_KEY);
      if (!cache?.data) return;
      if (cache.data.event.length === 0) return;

      const capturedEvents = cache.data.event;

      await syncEvent(capturedEvents);

      dropFromCache(ANALYTIC_CACHE_KEY);
    } catch (error) {
      // stop and destroy all events
      this.stop();
      dropFromCache(ANALYTIC_CACHE_KEY);
    }
  }

  async syncHighPriorityCapturedEvent() {
    try {
      // Must query only objects that have same userId with current logged-in user.
      // Query captured event with maximum of 1000
      // Order by latest first
      // e.g., If there are 2000 events we will query 1000-2000 first
      const cache = pullFromCache<{ event: Amity.AnalyticEventModel[] }>(
        HIGH_PRIORITY_ANALYTIC_CACHE_KEY,
      );
      if (!cache?.data) return;
      if (cache.data.event.length === 0) return;

      const capturedEvents = cache.data.event;

      await syncEvent(capturedEvents);

      dropFromCache(HIGH_PRIORITY_ANALYTIC_CACHE_KEY);
    } catch (error) {
      // stop and destroy all events
      this.stop();
      dropFromCache(HIGH_PRIORITY_ANALYTIC_CACHE_KEY);
    }
  }
}
