import { syncUsage } from '../api/syncUsage';

/*
 * It was originally planned to be 10 seconds but the signature creation is a
 * slow process and can take upto 4 to 5 seconds, which might lead to data
 * inconsitencies and adds complexity to manging sync data.
 *
 * Hence, I've incerased the USAGE_SYNC_INTERVAL to ensure a more maintainable
 * code
 */
export const USAGE_SYNC_INTERVAL = 20 * 1000; // 20 seconds;

/**
 * @class
 *
 * Usage Collector is responsible for collecting data from live stream video
 * events and periodically passing the collected data down to Usage Syncer
 *
 */
export class UsageCollector {
  // all unsynced usage data
  _unsyncedData: Amity.UsageDataModel[];

  _syncBuffer: Amity.UsageDataModel[];

  /*
   * all live streams that are currently updating usage to the usage collector
   * helps free resources if there are none
   */
  _activeStreams: string[];

  _syncInterval: null | ReturnType<typeof setInterval>;

  constructor() {
    this._unsyncedData = [];
    this._syncBuffer = [];
    this._activeStreams = [];
    this._startInterval();
    this._syncInterval = null;
  }

  registerStream(streamId: string) {
    this._activeStreams.push(streamId);
  }

  getActiveStreams() {
    return this._activeStreams;
  }

  unregisterStream(streamId: string) {
    this._activeStreams = this._activeStreams.filter(id => id !== streamId);
  }

  updateUsage(data: Amity.UsageDataModel) {
    this._unsyncedData.push(data);
  }

  /*
   * Buffer of all data that is currently being synced
   * This would help against data loss from new updates while the syncer is
   * attempting to update usage with the server.
   *
   * Also, makes it easier to keep track of synced data for successfull syncs.
   *
   * Without the buffer data integrity would need to be maintained between
   * what's been synced and whats not
   */
  bufferCurrentUsage() {
    const buffer = this._unsyncedData;
    this._unsyncedData = [];

    return buffer;
  }

  dispose() {
    // perform cleanup
    if (this._syncInterval) clearInterval(this._syncInterval);
  }

  _startInterval() {
    this._syncInterval = setInterval(() => {
      syncUsage({
        bufferCurrentUsage: this.bufferCurrentUsage.bind(this),
        getActiveStreams: this.getActiveStreams.bind(this),
        updateUsage: this.updateUsage.bind(this),
        dispose: this.dispose.bind(this),
      });
    }, USAGE_SYNC_INTERVAL);
  }
  /*
   * Should allow for data update
   * Maintain unsynced & syncing data
   *
   * Monitor active streams
   *
   * destroy syncer if no active streams
   */
}
