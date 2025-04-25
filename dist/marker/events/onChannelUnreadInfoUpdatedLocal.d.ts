/**
 * Internal used only
 *
 * Fired when an {@link Amity.channelUnreadInfo} has been updated.
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category ChannelMarker Events
 */
export declare const onChannelUnreadInfoUpdatedLocal: (callback: Amity.Listener<Amity.Events["local.channelUnreadInfo.updated"]>) => Amity.Unsubscriber;
