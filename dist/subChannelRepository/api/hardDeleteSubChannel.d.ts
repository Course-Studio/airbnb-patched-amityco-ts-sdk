/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.hardDeleteSubChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to hard delete
 * @return The {@link Amity.SubChannel} was hard deleted
 *
 * @category Channel API
 * @async
 */
export declare const hardDeleteSubChannel: (subChannelId: Amity.SubChannel['subChannelId']) => Promise<Amity.SubChannel>;
