/**
 * ```js
 * import { stopReading } from '@amityco/ts-sdk'
 * const success = await stopReading('foo')
 * ```
 *
 * Mark all messages as read and stop reading message inside channel
 *
 * @param messageFeedId - The sub channel ID to stop reading.
 * @return A success boolean if reading of the sub channel had begun.
 *
 * @category Channel API
 * @async
 * @private
 */
export declare const stopReadingAPI: (messageFeedId: Amity.SubChannel['subChannelId']) => Promise<boolean>;
//# sourceMappingURL=stopReadingAPI.d.ts.map