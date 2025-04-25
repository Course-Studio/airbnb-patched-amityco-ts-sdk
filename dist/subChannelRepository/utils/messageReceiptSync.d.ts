/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.startMessageReceiptSync(subChannelId)
 * ```
 *
 * Start reading a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to start reading
 * @return true if the reading of the sub channel had begun
 *
 * @category subChannel API
 * @async
 */
export declare const startMessageReceiptSync: (subChannelId: Amity.SubChannel["subChannelId"]) => Promise<boolean>;
/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.startMessageReceiptSync(subChannelId)
 * ```
 *
 * Start reading a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to start reading
 * @return true if the reading of the sub channel had begun
 *
 * @category subChannel API
 * @async
 */
export declare const stopMessageReceiptSync: (subChannelId: Amity.SubChannel["subChannelId"]) => boolean;
