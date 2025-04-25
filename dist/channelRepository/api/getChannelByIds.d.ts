/**
 * ```js
 * import { getChannelByIds } from '@amityco/ts-sdk'
 * const channels = await getChannelByIds(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Channel} objects
 *
 * @param channelIds the IDs of the {@link Amity.Channel} to fetch
 * @returns the associated collection of {@link Amity.Channel} objects
 *
 * @category Channel API
 * @async
 */
export declare const getChannelByIds: {
    (channelIds: Amity.Channel['channelPublicId'][]): Promise<Amity.Cached<Amity.Channel[]>>;
    /**
     * ```js
     * import { getChannelByIds } from '@amityco/ts-sdk'
     * const channels = getChannelByIds.locally(['foo', 'bar']) ?? []
     * ```
     *
     * Fetches a collection of {@link Amity.Channel} objects from cache
     *
     * @param channelIds the IDs of the {@link Amity.Channel} to fetch
     * @returns the associated collection of {@link Amity.Channel} objects
     *
     * @category Channel API
     */
    locally(channelIds: Amity.Channel['channelPublicId'][]): Amity.Cached<Amity.Channel[]> | undefined;
};
