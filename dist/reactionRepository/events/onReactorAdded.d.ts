/**
 * ```js
 * import { onReactorAdded } from '@amityco/ts-sdk'
 * const dispose = onReactorAdded('post', postId, reactor => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.InternalReactor} has been added
 *
 * @param {@link Amity.ReactableType} referenceType
 * @param {string} referenceId
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Events
 * */
export declare const onReactorAdded: (referenceType: Amity.ReactableType, referenceId: Amity.Reaction['referenceId'], callback: Amity.Listener<Amity.InternalReactor>) => Amity.Unsubscriber;
