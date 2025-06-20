/**
 * ```js
 * import { deleteChannel } from '@amityco/ts-sdk'
 * const success = await deleteChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.Channel}
 *
 * @param channelId The {@link Amity.Channel} ID to delete
 * @return A success boolean if the {@link Amity.Channel} was deleted
 *
 * @category Channel API
 * @async
 */
export declare const deleteChannel: (channelId: Amity.Channel["channelId"]) => Promise<Amity.InternalChannel>;
