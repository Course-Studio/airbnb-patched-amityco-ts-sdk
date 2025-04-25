/**
 * ```js
 * import { softDeleteMessage } from '@amityco/ts-sdk'
 * const success = await softDeleteMessage('foobar')
 * ```
 *
 * Delete a {@link Amity.Message}
 *
 * @param messageId the ID of the {@link Amity.Message} to delete
 * @return A success boolean if the {@link Amity.Message} was deleted
 *
 * @category Message API
 * @async
 */
export declare const softDeleteMessage: {
    (messageId: Amity.Message['messageId']): Promise<Amity.Message>;
    /**
     * ```js
     * import { softDeleteMessage } from '@amityco/ts-sdk'
     * const success = softDeleteMessage.optimistically('foobar')
     * ```
     *
     * Deletes a {@link Amity.Message}
     *
     * @param messageId The {@link Amity.Message} ID to delete
     * @return A success boolean if the {@link Amity.Message} was deleted
     *
     * @category Message API
     */
    optimistically(messageId: Amity.Message['messageId']): Amity.Cached<Amity.Message> | undefined;
};
