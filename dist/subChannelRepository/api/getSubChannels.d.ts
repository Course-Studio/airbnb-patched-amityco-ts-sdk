/**
 * ```js
 * import { getSubChannels } from '@amityco/ts-sdk'
 * const subChannels = await getSubChannels(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.SubChannel} objects
 *
 * @param subChannelIds the IDs of the {@link Amity.SubChannel} to fetch
 * @returns the associated collection of {@link Amity.SubChannel} objects
 *
 * @category Channel API
 * @async
 */
export declare const getSubChannels: {
    (subChannelIds: Amity.SubChannel["subChannelId"][]): Promise<Amity.Cached<Amity.SubChannel[]>>;
    locally(subChannelIds: Amity.SubChannel["subChannelId"][]): Amity.Cached<Amity.SubChannel[]> | undefined;
};
