/**
 * ```js
 * import { getMessage } from '@amityco/ts-sdk'
 * const message = await getMessage('foobar')
 * ```
 *
 * Fetches a {@link Amity.InternalMessage} object
 *
 * @param messageId the ID of the {@link Amity.Message} to fetch
 * @returns the associated {@link Amity.Message} object
 *
 * @category Message API
 * @async
 */
export declare const getMessage: {
    (messageId: Amity.Message['messageId'], isLive?: boolean): Promise<Amity.Cached<Amity.InternalMessage>>;
    /**
     * ```js
     * import { getMessage } from '@amityco/ts-sdk'
     * const message = getMessage.locally('foobar')
     * ```
     *
     * Fetches a {@link Amity.Message} object
     *
     * @param messageId the ID of the {@link Amity.Message} to fetch
     * @returns the associated {@link Amity.Message} object
     *
     * @category Message API
     */
    locally(messageId: Amity.Message['messageId']): Amity.Cached<Amity.InternalMessage> | undefined;
};
