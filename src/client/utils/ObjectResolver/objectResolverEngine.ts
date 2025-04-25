import { onOnline } from '../onOnline';

import { onOffline } from '../onOffline';
import { SECOND } from '~/utils/constants';
import { resolveChannels } from '~/channelRepository/utils/resolveChannels';
import { resolveUserMessageFeedMarkers } from '~/marker/utils/resolveUserMessageFeedMakers';

class ObjectResolverEngine {
  private readonly TIMER_INTERVAL_MS = SECOND;

  private readonly BUFFER_ID_LIMIT = 100;

  private buffer: Amity.ObjectIdBuffer = {
    [Amity.ReferenceType.CHANNEL]: [],
    [Amity.ReferenceType.USER_MESSAGE_FEED_MARKER]: [],
  };

  private timer: NodeJS.Timer | undefined;

  private isResolvingTask = false;

  private connectionListener: (() => void)[] = [];

  private isConnected = true;

  constructor() {
    this.addConnectionListener();
  }

  startResolver() {
    if (!this.timer) {
      this.timer = setInterval(() => {
        if (this.isConnected) this.resolveObjects();
      }, this.TIMER_INTERVAL_MS);
    }
  }

  stopResolver() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  resolve(id: string, referenceType: Amity.ReferenceType) {
    const objectIdList = this.getBuffer(referenceType);

    if (objectIdList.includes(id)) return;

    if (objectIdList.length >= this.BUFFER_ID_LIMIT) {
      objectIdList.shift(); // Remove first element of the array
    }

    objectIdList.push(id);
  }

  private addConnectionListener() {
    if (this.connectionListener.length > 0) return;
    this.connectionListener.push(
      onOnline(() => {
        this.isConnected = true;
      }),
    );

    this.connectionListener.push(
      onOffline(() => {
        this.isConnected = false;
      }),
    );
  }

  private removeConnectionListener() {
    if (this.connectionListener.length > 0) this.connectionListener.forEach(listener => listener());
  }

  private resolveObjects() {
    if (this.isResolvingTask) {
      return;
    }

    this.isResolvingTask = true;

    // Get first 100 ids for all reference type supported.
    const channelIds = this.getBuffer(Amity.ReferenceType.CHANNEL);
    const userMessageFeedMarkerIds = this.getBuffer(Amity.ReferenceType.USER_MESSAGE_FEED_MARKER);

    // Clear buffer
    this.clearBuffer();

    // Send Requests.
    // Incase of failure: Ignore
    // Incase of success: Persist in Domain DB & Notify Live collection
    if (channelIds.length > 0) resolveChannels(channelIds);
    if (userMessageFeedMarkerIds.length > 0)
      resolveUserMessageFeedMarkers(userMessageFeedMarkerIds);

    // After sending request
    this.isResolvingTask = false;
  }

  private clearBuffer() {
    this.buffer = {
      [Amity.ReferenceType.CHANNEL]: [],
      [Amity.ReferenceType.USER_MESSAGE_FEED_MARKER]: [],
    };
  }

  private getBuffer(referenceType: Amity.ReferenceType) {
    return this.buffer[referenceType];
  }

  // Session Management : SessionComponent
  onSessionEstablished() {
    this.startResolver();
    this.addConnectionListener();
  }

  onSessionDestroyed() {
    // Stop timer
    this.stopResolver();

    // Clear buffer
    this.clearBuffer();

    // Reset state
    this.isResolvingTask = false;

    // remove connection listener
    this.removeConnectionListener();
  }

  onTokenExpired() {
    this.stopResolver();
  }
}

let instance: ObjectResolverEngine | null = null;

export default {
  getInstance: () => {
    if (!instance) instance = new ObjectResolverEngine();
    return instance;
  },
};
