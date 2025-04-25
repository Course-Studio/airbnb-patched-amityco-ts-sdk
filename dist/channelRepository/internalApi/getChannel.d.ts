/**
 * ```js
 * import { getChannel } from '@amityco/ts-sdk'
 * const channel = await getChannel('foobar')
 * ```
 *
 * Fetches a {@link Amity.Channel} object
 *
 * @param channelId the ID of the {@link Amity.Channel} to fetch
 * @returns the associated {@link Amity.Channel} object
 *
 * @category Channel API
 * @async
 */
export declare const getChannel: {
    (channelId: Amity.Channel['channelPublicId']): Promise<Amity.Cached<Amity.StaticInternalChannel>>;
    /**
     * ```js
     * import { getChannel } from '@amityco/ts-sdk'
     * const channel = getChannel.locally('foobar')
     * ```
     *
     * Fetches a {@link Amity.Channel} object from cache
     *
     * @param channelId the ID of the {@link Amity.Channel} to fetch
     * @returns the associated {@link Amity.Channel} object
     *
     * @category Channel API
     */
    locally(channelId: Amity.Channel['channelPublicId']): Amity.Cached<Amity.StaticInternalChannel> | undefined;
};
//# sourceMappingURL=getChannel.d.ts.map