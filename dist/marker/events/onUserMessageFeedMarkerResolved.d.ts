/**
 * Internal used only
 *
 * Fired when an {@link Amity.userMessageFeedMarkers} has been resolved by Object Rsesolver
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category MessageMarker Events
 */
export declare const onUserMessageFeedMarkerResolved: (callback: Amity.Listener<Amity.Events['local.userMessageFeedMarkers.resolved']>) => Amity.Unsubscriber;
