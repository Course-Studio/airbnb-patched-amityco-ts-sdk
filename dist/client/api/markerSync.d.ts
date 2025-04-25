/**
 * ```js
 * import { markerSync } from '@amityco/ts-sdk'
 * const success = await markerSync()
 * ```
 *
 * Make all markers synced
 * * If response is empty means that the sync has ended.
 * * If response is not empty, the sync has not ended. You must call markerSync
 * again to continue syncing.
 *
 * @return {hasMore} A success boolean if the marker sync was ended.
 *
 * @category Marker API
 * @async
 * @private
 */
export declare const markerSync: (deviceLastSyncAt: string) => Promise<{
    data: Amity.MarkerSyncPayload;
    hasMore: boolean;
}>;
//# sourceMappingURL=markerSync.d.ts.map