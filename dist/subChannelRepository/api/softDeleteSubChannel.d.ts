/**
 * ```js
 * import { SubChannelRepository } from '@amityco/ts-sdk'
 * const success = await SubChannelRepository.softDeleteSubChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to soft delete
 * @return A success boolean if the {@link Amity.SubChannel} was soft deleted
 *
 * @category Channel API
 * @async
 */
export declare const softDeleteSubChannel: (subChannelId: Amity.SubChannel['subChannelId']) => Promise<Amity.SubChannel>;
