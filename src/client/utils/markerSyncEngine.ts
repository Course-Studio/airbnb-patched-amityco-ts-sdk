import {
  onChannelCreated,
  onChannelDeleted,
  onChannelJoined,
  onChannelLeft,
} from '~/channelRepository/events';
import { onUserMarkerSync } from '~/marker/events/onUserMarkerSync';
import { setIntervalTask } from '~/utils/timer';
import { getUserMarker } from '~/marker/api/getUserMarker';
import { onFeedMarkerUpdated } from '~/marker/events/onFeedlMarkerUpdated';
import { onMessageCreatedMqtt } from '~/messageRepository/events/onMessageCreated';
import { onSubChannelCreated } from '~/subChannelRepository/events/onSubChannelCreated';
import { onSubChannelDeleted } from '~/subChannelRepository/events/onSubChannelDeleted';
import { isUnreadCountSupport } from '~/subChannelRepository/utils';

import { markerSync } from '../api/markerSync';
import { enableUnreadCount } from '../api/enableUnreadCount';

import { onOnline } from './onOnline';
import { onUserFeedMarkerUpdated } from '~/marker/events/onUserFeedMarkerUpdated';
import { getActiveClient } from '~/client/api/activeClient';

const SYNC_TRIGGER_INTERVAL_TIME = 2000;
const ON_SUB_CHANNEL_DELETE_SYNC_TRIGGER_DELAY = 2000;

let isSyncRunning = false;
let disposers: (() => void)[] = [];
let isWaitingForResponse = false;

let isConsistentMode = true;
let deviceLastSyncAt: Date | null = null;

const getDeviceLastSyncAt = () => {
  if (deviceLastSyncAt == null) {
    return new Date();
  }

  return deviceLastSyncAt;
};

const saveDeviceLastSyncAt = (lastSyncAt: Date | null) => {
  if (lastSyncAt == null) return;
  if (!deviceLastSyncAt || lastSyncAt.getTime() > deviceLastSyncAt.getTime()) {
    deviceLastSyncAt = lastSyncAt;
  }
};

const fetchDeviceLastSyncAt = async () => {
  const { data: userMarker } = await getUserMarker();
  if (userMarker == null) return;
  saveDeviceLastSyncAt(new Date(userMarker.lastSyncAt));
};

/**
 * list of conditions that make timer still trigger the syncing process.
 * If it's empty, it means sync is stopped.
 * if it's not empty, sync will resume.
 */
let events: Amity.MarkerSyncEvent[] = [];

/**
 * get current marker sync event list
 * @private
 */
export const getMarkerSyncEvents = () => events;

/**
 * set marker sync events
 * @private
 */
export const setMarkerSyncEvents = (newEvents: Amity.MarkerSyncEvent[]) => {
  events = newEvents;
};

/**
 * push new event to marker sync events
 * @private
 */
export const pushMarkerSyncEvent = (event: Amity.MarkerSyncEvent) => events.push(event);

/**
 * interval task
 * @private
 */
export const markerSyncTrigger = async () => {
  if (isWaitingForResponse) {
    // waiting for the response no need to make another API call
    return;
  }

  if (events.length === 0) {
    // no event that require to call marker sync API
    return;
  }
  try {
    isWaitingForResponse = true;
    // any past events are considered processed here.
    // however during waiting for the response, RTE could add the new message event;
    // which will make the engine trigger another call next round.
    events = [];

    const response = await markerSync(getDeviceLastSyncAt().toISOString());

    const latestLastSyncAt: Date | null = response.data.userMarkers.reduce(
      (maxLastSyncAt, userMarker) => {
        if (
          maxLastSyncAt == null ||
          maxLastSyncAt.getTime() < new Date(userMarker.lastSyncAt).getTime()
        ) {
          return new Date(userMarker.lastSyncAt);
        }

        return maxLastSyncAt;
      },
      null as Date | null,
    );

    saveDeviceLastSyncAt(latestLastSyncAt);

    if (response.hasMore) {
      events.push(Amity.MarkerSyncEvent.HAS_MORE);
    }
  } catch {
    // prevent sync from stopping
  } finally {
    if (isWaitingForResponse) {
      isWaitingForResponse = false;
    }
  }
};

const registerEventListeners = () => {
  if (disposers.length > 0) {
    return;
  }
  // based on the tech spec design, we designed a fetch marker in case of these events
  // - new message
  // - create channel
  // - remove channel
  // - app going to online again after offline
  disposers.push(
    onOnline(() => {
      // should add RESUME to the event to trigger marker syncing again
      events.push(Amity.MarkerSyncEvent.RESUME);
    }),

    onMessageCreatedMqtt(message => {
      // only conversation, community and broadcast types can sync
      const client = getActiveClient();
      if (isUnreadCountSupport(message) && message.creatorId !== client.userId)
        events.push(Amity.MarkerSyncEvent.NEW_MESSAGE);
    }),

    onChannelCreated(() => events.push(Amity.MarkerSyncEvent.CHANNEL_CREATED)),
    onChannelDeleted(() => events.push(Amity.MarkerSyncEvent.CHANNEL_DELETED)),
    onChannelJoined(() => events.push(Amity.MarkerSyncEvent.CHANNEL_JOINED)),
    onChannelLeft(() => events.push(Amity.MarkerSyncEvent.CHANNEL_LEFT)),
    onSubChannelCreated(() => events.push(Amity.MarkerSyncEvent.SUB_CHANNEL_CREATED)),
    onSubChannelDeleted(() =>
      /*
       workaround: when receiving the event for sub-channel deletion,
       before triggering marker update, the SDK will have to add a 2-second delay.
       so that the unread count is calculated correctly.
      */
      setTimeout(
        () => events.push(Amity.MarkerSyncEvent.SUBCHANNEL_IS_DELETED),
        ON_SUB_CHANNEL_DELETE_SYNC_TRIGGER_DELAY,
      ),
    ),
    onFeedMarkerUpdated(() => events.push(Amity.MarkerSyncEvent.MARKER_UPDATED)),
    onUserMarkerSync(() => events.push(Amity.MarkerSyncEvent.MARKER_UPDATED)),
    onUserFeedMarkerUpdated(() => events.push(Amity.MarkerSyncEvent.MARKER_UPDATED)),
  );
};

const unRegisterEventListeners = () => {
  disposers.forEach(fn => fn());
  disposers = [];
};

export const startMarkerSync = async () => {
  await fetchDeviceLastSyncAt();
  pushMarkerSyncEvent(Amity.MarkerSyncEvent.START_SYNCING);

  isConsistentMode = true;
  isSyncRunning = true;

  registerEventListeners();

  return unRegisterEventListeners;
};

/**
 ```js
 * import { startUnreadSync } from '@amityco/ts-sdk'
 * startUnreadSync()
 * ```
 *
 * start syncing to keep feed markers, channel markers and user makers cache
 * update to the server.
 *
 * @category Marker API
 */
export const startUnreadSync = async () => {
  await fetchDeviceLastSyncAt();
  pushMarkerSyncEvent(Amity.MarkerSyncEvent.START_SYNCING);

  enableUnreadCount();

  isConsistentMode = false;
  isSyncRunning = true;

  registerEventListeners();
};

/**
 ```js
 * import { stopUnreadSync } from '@amityco/ts-sdk'
 * stopUnreadSync()
 * ```
 *
 * stop unread syncing
 *
 * @category Marker API
 */
export const stopUnreadSync = () => {
  isSyncRunning = false;
  setMarkerSyncEvents([]);
  unRegisterEventListeners();
};

setIntervalTask(async () => {
  if (!isSyncRunning) return;

  await markerSyncTrigger();
}, SYNC_TRIGGER_INTERVAL_TIME);

export const getMarkerSyncConsistentMode = () => isConsistentMode;
