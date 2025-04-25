import uuid from 'react-native-uuid';
import { getUsageCollector } from '../api/getUsageCollector';

const SECOND = 1000;
/*
 * Usage collection interval is different from usage sync interval. Ideally it
 * needs to be slightly lower than the usage sync interval as it's more likely
 * that the live stream will stop playing than the sync failing
 */
const USAGE_COLLECTION_INTERVAL = 20 * SECOND;

/*
 * Register events and their handlers
 *
 * 3 Types: Play, Pause / Stop, & Unmount
 *  1. Each handler will have access to startTime, which can be an iso string or
 *  null
 *  2. Get the usage collector instance to update usage
 */
export class EventRegister {
  player: HTMLVideoElement;

  _startTime: null | number;

  _usageCollector: ReturnType<typeof getUsageCollector>;

  resolution: null | string;

  _controller: AbortController;

  _sessionId: null | string;

  _observer: MutationObserver;

  constructor(player: HTMLVideoElement, resolution: string) {
    this.player = player;
    this.resolution = resolution;
    this._startTime = null;

    this._usageCollector = getUsageCollector();
    this._usageCollector.registerStream(player.id);

    this._sessionId = String(uuid.v4());

    this._controller = new AbortController();

    /*
     * MutationObserver allows for auto removal of all event handlers that are
     * added to register usage
     */
    this._observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.removedNodes.forEach(node => {
          if (node === player) {
            this._unregisterEvents();
          }
        });
      });
    });
  }

  _resetStartTime() {
    this._startTime = Date.now();
  }

  _shouldUpdateCollector() {
    /*
     * a null value on startTime indicates a stream that is not playing
     */
    if (!this._startTime) return false;

    if (Date.now() - this._startTime > USAGE_COLLECTION_INTERVAL) {
      return true;
    }

    return false;
  }

  _sendUsageToCollector() {
    if (!this._startTime) return;

    const endTime = Date.now();
    const watchMilliseconds = endTime - this._startTime;
    const watchSeconds = Math.round(watchMilliseconds / SECOND);

    /*
     * Quite rare but can happen
     */
    if (!watchSeconds) return;

    this._usageCollector.updateUsage({
      streamId: this.player.id,
      sessionId: this._sessionId!,
      startTime: this._startTime ? new Date(this._startTime).toISOString() : null!,
      endTime: new Date(endTime).toISOString(),
      watchSeconds,
      resolution: this.resolution!,
    });
  }

  registerEvents() {
    this.player.addEventListener(
      'play',
      () => {
        if (!this._startTime) {
          this._resetStartTime();
        }
      },
      { signal: this._controller.signal },
    );

    // Playing event is fired after playback is started after being paused
    this.player.addEventListener(
      'playing',
      () => {
        if (!this._startTime) {
          this._resetStartTime();
        }
      },
      { signal: this._controller.signal },
    );

    this.player.addEventListener(
      'timeupdate',
      () => {
        if (this._shouldUpdateCollector()) {
          this._sendUsageToCollector();

          this._resetStartTime();
        }
      },
      { signal: this._controller.signal },
    );

    this.player.addEventListener(
      'pause',
      () => {
        this._sendUsageToCollector();

        this._startTime = null;
      },
      {
        signal: this._controller.signal,
      },
    );

    this.player.addEventListener(
      'ended',
      () => {
        this._sendUsageToCollector();

        this._startTime = null;
      },
      {
        signal: this._controller.signal,
      },
    );
  }

  // perform cleanup when element is removed from DOM
  _unregisterEvents() {
    this._usageCollector.unregisterStream(this.player.id);
    // remove event listeners
    this._controller.abort();
    this._observer.disconnect();
  }
}
