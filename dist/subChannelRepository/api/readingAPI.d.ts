/**
 * ```js
 * import { SubChannel } from '@amityco/ts-sdk'
 * const success = await SubChannel('foo')
 * ```
 *
 * Mark all messages as read and start reading message inside channel
 *
 * @param messageFeedIds - Sub channel ID list to start reading.
 * @return A success boolean if reading of the sub channel had begun.
 *
 * @category Channel API
 * @async
 * @private
 */
export declare const readingAPI: (messageFeedIds: Amity.SubChannel['subChannelId'][]) => Promise<boolean>;
//# sourceMappingURL=readingAPI.d.ts.map