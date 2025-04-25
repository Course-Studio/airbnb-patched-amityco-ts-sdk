/**
 * ```js
 * import { SubChannel } from '@amityco/ts-sdk'
 * const success = await SubChannel('foo')
 * ```
 *
 * Mark all messages as read and start reading message inside channel
 *
 * @param messageFeedId - Sub channel ID to start reading.
 * @return A success boolean if reading of the sub channel had begun.
 *
 * @category Channel API
 * @async
 * @private
 */
export declare const startReadingAPI: (messageFeedId: Amity.SubChannel['subChannelId']) => Promise<boolean>;
//# sourceMappingURL=startReadingAPI.d.ts.map