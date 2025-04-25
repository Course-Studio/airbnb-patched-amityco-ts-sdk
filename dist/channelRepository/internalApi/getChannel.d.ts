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
    (channelId: Amity.Channel["channelPublicId"]): Promise<Amity.Cached<Amity.StaticInternalChannel>>;
    locally(channelId: Amity.Channel["channelPublicId"]): Amity.Cached<Amity.StaticInternalChannel> | undefined;
};
