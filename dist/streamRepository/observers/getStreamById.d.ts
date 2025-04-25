/**
 * ```js
 * import { StreamRepository } from '@amityco/ts-sdk'
 * const unsub = StreamRepository.getStreamById('foobar')
 * unsub()
 * ```
 *
 * Fetches a {@link Amity.Stream} object
 *
 * @param streamId the ID of the {@link Amity.Stream} to get
 * @param callback
 * @returns the associated {@link Amity.Stream} object
 *
 * @category Stream Live Object
 */
export declare const getStreamById: {
    (streamId: Amity.Stream['streamId'], callback: Amity.LiveObjectCallback<Amity.Stream>): Amity.Unsubscriber;
    /**
     * ```js
     * import { StreamRepository } from '@amityco/ts-sdk'
     * const stream = StreamRepository.getStreamById.locally('foobar')
     * ```
     *
     * Fetches a {@link Amity.Stream} live object
     *
     * @param streamId the ID of the {@link Amity.Stream} to fetch
     * @returns the associated {@link Amity.Stream} live object
     *
     * @category Stream API
     */
    locally(streamId: Amity.Stream['streamId']): Amity.Cached<Amity.Stream> | undefined;
};
