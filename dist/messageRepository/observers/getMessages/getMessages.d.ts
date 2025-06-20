/**
 * ```js
 * import { getMessages } from '@amityco/ts-sdk';
 *
 * let messages = [];
 *
 * const unsubscribe = getMessages({
 *   subChannelId: Amity.SubChannel['subChannelId'];
 * }, response => merge(messages, response.data));
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Message} for a given target object
 *
 * @param params for querying messages from a sub channel
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Messages Live Collection
 */
export declare const getMessages: (params: Amity.MessagesLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Message>, config?: Amity.LiveCollectionConfig) => Amity.Unsubscriber;
