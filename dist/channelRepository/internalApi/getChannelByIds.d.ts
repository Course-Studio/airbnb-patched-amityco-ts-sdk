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
    (channelIds: Amity.Channel["channelPublicId"][]): Promise<Amity.Cached<Amity.StaticInternalChannel[]>>;
    locally(channelIds: Amity.Channel["channelPublicId"][]): Amity.Cached<Amity.StaticInternalChannel[]> | undefined;
};
