/**
 * ```js
 * import { getMessages } from '@amityco/ts-sdk'
 * const messages = await getMessages(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Message} objects
 *
 * @param messageIds the IDs of the {@link Amity.Message} to fetch
 * @returns the associated collection of {@link Amity.Message} objects
 *
 * @category Message API
 * @async
 */
export declare const getMessages: {
    (messageIds: Amity.Message["messageId"][]): Promise<Amity.Cached<Amity.InternalMessage[]>>;
    locally(messageIds: Amity.Message["messageId"][]): Amity.Cached<Amity.InternalMessage[]> | undefined;
};
