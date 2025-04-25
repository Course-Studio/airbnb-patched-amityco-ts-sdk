/**
 * ```js
 * import { onReactorRemoved } from '@amityco/ts-sdk'
 * const dispose = onReactorRemoved('post', postId, reactor => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.InternalReactor} has been removed
 *
 * @param {@link Amity.ReactableType} referenceType
 * @param {string} referenceId
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Events
 * */
export declare const onReactorRemoved: (referenceType: Amity.ReactableType, referenceId: Amity.Reaction['referenceId'], callback: Amity.Listener<Amity.InternalReactor>) => Amity.Unsubscriber;
//# sourceMappingURL=onReactorRemoved.d.ts.map