/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk'
 *
 * let channelMembers = []
 * const unsub = ChannelRepository.Membership.searchMembers({
 *   channelId: Amity.Channel['channelId'],
 * }, response => merge(channelMembers, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.ChannelUser}s
 *
 * @param params for searching channel users
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the channel users
 *
 * @category Channel Live Collection
 */
export declare const searchMembers: (params: Amity.SearchChannelMembers, callback: Amity.LiveCollectionCallback<Amity.Membership<"channel">>, config?: Amity.LiveCollectionConfig) => () => void;
