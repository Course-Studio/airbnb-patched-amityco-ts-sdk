/**
 * get current marker sync event list
 * @private
 */
export declare const getMarkerSyncEvents: () => Amity.MarkerSyncEvent[];
/**
 * set marker sync events
 * @private
 */
export declare const setMarkerSyncEvents: (newEvents: Amity.MarkerSyncEvent[]) => void;
/**
 * push new event to marker sync events
 * @private
 */
export declare const pushMarkerSyncEvent: (event: Amity.MarkerSyncEvent) => number;
/**
 * interval task
 * @private
 */
export declare const markerSyncTrigger: () => Promise<void>;
export declare const startMarkerSync: () => Promise<() => void>;
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
export declare const startUnreadSync: () => Promise<void>;
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
export declare const stopUnreadSync: () => void;
export declare const getMarkerSyncConsistentMode: () => boolean;
//# sourceMappingURL=markerSyncEngine.d.ts.map