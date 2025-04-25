import { pullFromCache, pushToCache, queryCache } from '~/cache/api';
import { getActiveClient } from '../../api/activeClient';
import { fireEvent } from '~/core/events';
import { markChannelsAsReadBySegment } from '~/channelRepository/api/markChannelsAsReadBySegment';

export class MessageReadReceiptSyncEngine {
  private client: Amity.Client;

  private isActive = true;

  private MAX_RETRY = 3;

  private JOB_QUEUE_SIZE = 120;

  private jobQueue: Amity.ReadReceiptSyncJob[] = [];

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

    const readReceipts = this.getReadReceipts();
    if (readReceipts) {
      this.markReadApi(readReceipts);
    }
  }

  private getUnsyncJobs(): void {
    // Get all read receipts that has latestSyncSegment < latestSegment
    const readReceipts = queryCache<Amity.ReadReceipt>(['readReceipt'])?.filter(({ data }) => {
      return data.latestSyncSegment < data.latestSegment;
    });

    // Enqueue unsync read receipts to the job queue
    readReceipts?.forEach(({ data: readReceipt }) => {
      this.enqueueReadReceipt(readReceipt.channelId, readReceipt.latestSegment);
    });
  }

  private getReadReceipts(): Amity.ReadReceiptSyncJob[] | undefined {
    // get all read receipts from queue, now the queue is empty
    const syncJob = this.jobQueue.splice(0, this.jobQueue.length);
    if (syncJob.length === 0) return;

    return syncJob.filter(job => {
      const readReceipt = pullFromCache<Amity.ReadReceipt>(['readReceipt', job.channelId])?.data;
      if (!readReceipt) return false;
      if (readReceipt.latestSegment > readReceipt.latestSyncSegment) return true;
      return false;
    });
  }

  private async markReadApi(syncJobs: Amity.ReadReceiptSyncJob[]): Promise<void> {
    // constuct payload
    // example: [{ channelId: 'channelId', readToSegment: 2 }]
    const syncJobsPayload = syncJobs.map(job => {
      return {
        channelId: job.channelId,
        readToSegment: job.segment,
      };
    });

    const response = await markChannelsAsReadBySegment(syncJobsPayload);

    if (response) {
      for (let i = 0; i < syncJobs.length; i += 1) {
        // update lastestSyncSegment in read receipt cache
        const cacheKey = ['readReceipt', syncJobs[i].channelId];
        const readReceiptCache = pullFromCache<Amity.ReadReceipt>(cacheKey)?.data;

        pushToCache(cacheKey, {
          ...readReceiptCache,
          latestSyncSegment: syncJobs[i].segment,
        });
      }
    } else {
      for (let i = 0; i < syncJobs.length; i += 1) {
        // push them back to queue if the syncing is failed and retry count is less than max retry
        if (syncJobs[i].retryCount >= this.MAX_RETRY) return;

        const updatedJob = {
          ...syncJobs[i],
          syncState: Amity.ReadReceiptSyncState.CREATED,
          retryCount: syncJobs[i].retryCount + 1,
        };

        this.enqueueJob(updatedJob);
      }
    }
  }

  private startObservingReadReceiptQueue(): void {
    if (this.client.useLegacyUnreadCount) {
      this.isActive = true;
      this.startSyncReadReceipt();
    }
  }

  private stopObservingReadReceiptQueue(): void {
    this.isActive = false;

    this.jobQueue.map(job => {
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

  markRead(channelId: string, segment: number): void {
    // Step 1: Optimistic update of channelUnread.readToSegment to message.segment and update unreadCount value
    const cacheKey = ['channelUnread', 'get', channelId];
    const channelUnread = pullFromCache<Amity.ChannelUnread>(cacheKey)?.data;

    if (
      typeof channelUnread?.readToSegment === 'number' &&
      channelUnread &&
      segment > channelUnread.readToSegment
    ) {
      channelUnread.readToSegment = segment;
      channelUnread.unreadCount = Math.max(channelUnread.lastSegment - segment, 0);

      pushToCache(cacheKey, channelUnread);
      fireEvent('local.channelUnread.updated', channelUnread);
    }

    // Step 2: Enqueue the read receipt
    this.enqueueReadReceipt(channelId, segment);
  }

  private enqueueReadReceipt(channelId: string, segment: number): void {
    const readReceipt = pullFromCache<Amity.ReadReceipt>(['readReceipt', channelId])?.data;

    // Create new read receipt if it's not exists and add the job to queue
    if (!readReceipt) {
      const readReceiptChannel: Amity.ReadReceipt = {
        channelId,
        latestSegment: segment,
        latestSyncSegment: 0,
      };
      pushToCache(['readReceipt', channelId], readReceiptChannel);
    } else if (readReceipt.latestSegment < segment) {
      // Update latestSegment in read receipt cache
      pushToCache(['readReceipt', channelId], { ...readReceipt, latestSegment: segment });
    } else if (readReceipt.latestSyncSegment >= segment) {
      // Skip the job when lastSyncSegment > = segment
      return;
    }

    let syncJob: Amity.ReadReceiptSyncJob | null = this.getSyncJob(channelId);

    if (syncJob === null || syncJob.syncState === Amity.ReadReceiptSyncState.SYNCING) {
      syncJob = {
        channelId,
        segment,
        syncState: Amity.ReadReceiptSyncState.CREATED,
        retryCount: 0,
      };

      this.enqueueJob(syncJob);
    } else if (syncJob.segment < segment) {
      syncJob.segment = segment;
    }
  }

  private getSyncJob(channelId: string): Amity.ReadReceiptSyncJob | null {
    const { jobQueue } = this;
    const targetJob = jobQueue.find(job => job.channelId === channelId);
    return targetJob || null;
  }

  private enqueueJob(syncJob: Amity.ReadReceiptSyncJob) {
    if (this.jobQueue.length < this.JOB_QUEUE_SIZE) {
      this.jobQueue.push(syncJob);
    } else {
      // Remove oldest job when queue reach maximum capacity
      this.jobQueue.shift();
      this.jobQueue.push(syncJob);
    }
  }
}

let instance: MessageReadReceiptSyncEngine | null = null;

export default {
  getInstance: () => {
    if (!instance) instance = new MessageReadReceiptSyncEngine();

    return instance;
  },
};
