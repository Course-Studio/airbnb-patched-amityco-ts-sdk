/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const updated = await MessageRepository.editMessage(messageId, {
 *   data: { text: 'hello world' }
 * })
 * ```
 *
 * Updates an {@link Amity.Message}
 *
 * @param messageId The ID of the {@link Amity.Message} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Message} object
 *
 * @category Message API
 * @async
 */
export declare const editMessage: {
    (messageId: Amity.Message["messageId"], patch: Patch<Amity.Message, "data" | "tags" | "metadata" | "mentionees">): Promise<Amity.Cached<Amity.Message>>;
    optimistically(messageId: Amity.Message["messageId"], patch: Patch<Amity.Message, "data" | "tags" | "metadata" | "mentionees">): Amity.Cached<Amity.Message> | undefined;
};
