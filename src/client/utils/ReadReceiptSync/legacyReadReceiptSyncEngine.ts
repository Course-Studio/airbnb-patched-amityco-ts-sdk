import { pullFromCache, pushToCache, queryCache } from '~/cache/api';
import { getActiveClient } from '../../api/activeClient';
import { markAsReadBySegment } from '~/subChannelRepository/api/markAsReadBySegment';
import { reCalculateChannelUnreadInfo } from '~/marker/utils/reCalculateChannelUnreadInfo';
import { fireEvent } from '~/core/events';

export class LegacyMessageReadReceiptSyncEngine {
  private client: Amity.Client;

  private isActive = true;

  private MAX_RETRY = 3;

  private JOB_QUEUE_SIZE = 120;

  private jobQueue: Amity.LegacyReadReceiptSyncJob[] = [];

  private timer: NodeJS.Timer | undefined;

  // Interval for message read receipt sync in seconds
  private RECEIPT_SYNC_INTERVAL = 1;

  constructor() {
    this.client = getActiveClient();
    // Get remaining unsync read receipts from cache
    this.getUnsyncJobs();
  }

  //  Call this when client call client.login
  startSyncReadReceipt() {
    // Start timer when start receipt sync
    this.timer = setInterval(() => {
      this.syncReadReceipts();
    }, this.RECEIPT_SYNC_INTERVAL * 1000);
  }

  // Read receipt observer handling
  syncReadReceipts(): void {
    if (this.jobQueue.length === 0 || this.isActive === false) return;

    const readReceipt = this.getReadReceipt();
    if (readReceipt) {
      this.markReadApi(readReceipt);
    }
  }

  private getUnsyncJobs(): void {
    // Get all read receipts that has latestSyncSegment < latestSegment
    const readReceipts = queryCache<Amity.LegacyReadReceipt>(['legacyReadReceipt'])?.filter(
      ({ data }) => {
        return data.latestSyncSegment < data.latestSegment;
      },
    );

    // Enqueue unsync read receipts to the job queue
    readReceipts?.forEach(({ data: readReceipt }) => {
      this.enqueueReadReceipt(readReceipt.subChannelId, readReceipt.latestSegment);
    });
  }

  private getReadReceipt(): Amity.LegacyReadReceiptSyncJob | undefined {
    // Get first read receipt in queue
    const syncJob = this.jobQueue[0];

    if (!syncJob) return;
    // Skip when it's syncing
    if (syncJob.syncState === Amity.ReadReceiptSyncState.SYNCING) return;

    // Get readReceipt from cache by subChannelId
    const readReceipt = pullFromCache<Amity.LegacyReadReceipt>([
      'legacyReadReceipt',
      syncJob.subChannelId,
    ])?.data;

    if (!readReceipt) return;

    if (readReceipt?.latestSegment > readReceipt?.latestSyncSegment) {
      syncJob.segment = readReceipt.latestSegment;
      return syncJob;
    }
    // Clear all synced job in job queue
    this.removeSynedReceipt(readReceipt.subChannelId, readReceipt.latestSegment);

    // Recursion getReadReceipt() until get unsync read receipt or job queue is empty
    return this.getReadReceipt();
  }

  private async markReadApi(syncJob: Amity.LegacyReadReceiptSyncJob): Promise<void> {
    const newSyncJob = syncJob;
    newSyncJob.syncState = Amity.ReadReceiptSyncState.SYNCING;

    const { subChannelId, segment } = newSyncJob;

    const response = await markAsReadBySegment({ subChannelId, readToSegment: segment });

    if (response) {
      this.removeSynedReceipt(syncJob.subChannelId, syncJob.segment);

      const readReceiptCache = pullFromCache<Amity.LegacyReadReceipt>([
        'legacyReadReceipt',
        subChannelId,
      ])?.data;

      pushToCache(['legacyReadReceipt', subChannelId], {
        ...readReceiptCache,
        latestSyncSegment: segment,
      });
    } else if (!response) {
      if (newSyncJob.retryCount > this.MAX_RETRY) {
        this.removeJobFromQueue(newSyncJob);
      } else {
        newSyncJob.retryCount += 1;
        newSyncJob.syncState = Amity.ReadReceiptSyncState.CREATED;
      }
    }
  }

  private removeSynedReceipt(subChannelId: string, segment: number) {
    const syncJobs = this.jobQueue;

    syncJobs.forEach(job => {
      if (job.subChannelId === subChannelId && job.segment <= segment) {
        this.removeJobFromQueue(job);
      }
    });
  }

  private startObservingReadReceiptQueue(): void {
    if (this.client.isUnreadCountEnabled) {
      this.isActive = true;
      this.startSyncReadReceipt();
    }
  }

  private stopObservingReadReceiptQueue(): void {
    this.isActive = false;

    const syncJobs = this.jobQueue;
    syncJobs.map(job => {
      if (job.syncState === Amity.ReadReceiptSyncState.SYNCING) {
        return { ...job, syncState: Amity.ReadReceiptSyncState.CREATED };
      }

      return job;
    });

    if (this.timer) clearInterval(this.timer);
  }

  // Session Management
  onSessionEstablished(): void {
    this.startObservingReadReceiptQueue();
  }

  onSessionDestroyed(): void {
    this.stopObservingReadReceiptQueue();
    this.jobQueue = [];
  }

  onTokenExpired(): void {
    this.stopObservingReadReceiptQueue();
  }

  // Network Connection Management
  onNetworkOffline(): void {
    // Stop observing to the read receipt queue.
    this.stopObservingReadReceiptQueue();
  }

  onNetworkOnline(): void {
    // Resume observing to the read receipt queue.
    this.startObservingReadReceiptQueue();
  }

  markRead(subChannelId: string, segment: number): void {
    // Step 1: Optimistic update of subChannelUnreadInfo.readToSegment to message.segment
    const cacheKey = ['subChannelUnreadInfo', 'get', subChannelId];
    const subChannelUnreadInfo = pullFromCache<Amity.SubChannelUnreadInfo>(cacheKey)?.data;

    if (subChannelUnreadInfo && segment > subChannelUnreadInfo.readToSegment) {
      subChannelUnreadInfo.readToSegment = segment;
      subChannelUnreadInfo.unreadCount = Math.max(subChannelUnreadInfo.lastSegment - segment, 0);

      const channelUnreadInfo = reCalculateChannelUnreadInfo(subChannelUnreadInfo.channelId);
      fireEvent('local.channelUnreadInfo.updated', channelUnreadInfo);

      pushToCache(cacheKey, subChannelUnreadInfo);
      fireEvent('local.subChannelUnread.updated', subChannelUnreadInfo);
    }

    // Step 2: Enqueue the read receipt
    this.enqueueReadReceipt(subChannelId, segment);
  }

  private enqueueReadReceipt(subChannelId: string, segment: number): void {
    const readReceipt = pullFromCache<Amity.LegacyReadReceipt>([
      'legacyReadReceipt',
      subChannelId,
    ])?.data;

    // Create new read receipt if it's not exists and add job to queue
    if (!readReceipt) {
      const readReceiptSubChannel: Amity.LegacyReadReceipt = {
        subChannelId,
        latestSegment: segment,
        latestSyncSegment: 0,
      };

      pushToCache(['legacyReadReceipt', subChannelId], readReceiptSubChannel);
    } else if (readReceipt.latestSegment < segment) {
      pushToCache(['legacyReadReceipt', subChannelId], { ...readReceipt, latestSegment: segment });
    } else if (readReceipt.latestSyncSegment >= segment) {
      // Skip the job when lastSyncSegment > = segment
      return;
    }

    let syncJob: Amity.LegacyReadReceiptSyncJob | null = this.getSyncJob(subChannelId);

    if (syncJob === null || syncJob.syncState === Amity.ReadReceiptSyncState.SYNCING) {
      syncJob = {
        subChannelId,
        segment,
        syncState: Amity.ReadReceiptSyncState.CREATED,
        retryCount: 0,
      };

      this.enqueueJob(syncJob);
    } else if (syncJob.segment < segment) {
      syncJob.segment = segment;
    }
  }

  private getSyncJob(subChannelId: string): Amity.LegacyReadReceiptSyncJob | null {
    const syncJobs = this.jobQueue;

    const targetJob = syncJobs.find(job => job.subChannelId === subChannelId);

    return targetJob || null;
  }

  private enqueueJob(syncJob: Amity.LegacyReadReceiptSyncJob) {
    if (this.jobQueue.length < this.JOB_QUEUE_SIZE) {
      this.jobQueue.push(syncJob);
    } else {
      // Remove oldest job when queue reach maximum capacity
      this.jobQueue.shift();
      this.jobQueue.push(syncJob);
    }
  }

  private removeJobFromQueue(item: Amity.LegacyReadReceiptSyncJob) {
    const index = this.jobQueue.indexOf(item);
    if (index > -1) {
      this.jobQueue.splice(index, 1);
    }
  }
}

let instance: LegacyMessageReadReceiptSyncEngine | null = null;

export default {
  getInstance: () => {
    if (!instance) instance = new LegacyMessageReadReceiptSyncEngine();

    return instance;
  },
};
