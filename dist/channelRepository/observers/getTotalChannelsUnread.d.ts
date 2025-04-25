/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk';
 *
 * let totalChannelsUnread;
 *
 * const unsubscribe = ChannelRepository.getTotalChannelsUnread(response => {
 *   unread = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.UserUnread}
 *
 * @returns An {@link Amity.UserUnread} function to run when willing to stop observing the message
 *
 * @category User Unread Live Object
 *
 */
export declare const getTotalChannelsUnread: (callback: Amity.LiveObjectCallback<Amity.UserUnread | undefined>) => Amity.Unsubscriber;
