/**
 * ```js
 * import { deleteSubChannel } from '~/subChannelRepository/api/deleteSubChannel'
 * const success = await deleteSubChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to delete
 * @return A the {@link Amity.SubChannel} was deleted
 *
 * @private
 * @async
 */
export declare const deleteSubChannel: (subChannelId: Amity.SubChannel['subChannelId'], permanent?: boolean) => Promise<Amity.SubChannel>;
