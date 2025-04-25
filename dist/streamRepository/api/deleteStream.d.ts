/**
 * ```js
 * import { deleteStream } from '@amityco/ts-sdk'
 * const success = await deleteStream(streamId)
 * ```
 *
 * Deletes a {@link Amity.InternalStream}
 *
 * @param streamId The {@link Amity.InternalStream} ID to delete
 * @return A success boolean if the {@link Amity.InternalStream} was deleted
 *
 * @category Stream API
 * @async
 */
export declare const deleteStream: (streamId: Amity.InternalStream["streamId"]) => Promise<boolean>;
