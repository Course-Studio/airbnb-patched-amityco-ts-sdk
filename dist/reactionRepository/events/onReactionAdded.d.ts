/**
 * ```js
 * import { onReactionAdded } from '@amityco/ts-sdk'
 * const dispose = onReactionAdded('post', postId, post => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Reaction} has been added
 *
 * @param {@link Amity.ReactableType} referenceType
 * @param {string} referenceId
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 * */
export declare const onReactionAdded: (referenceType: Amity.ReactableType, referenceId: Amity.Reaction["referenceId"], callback: Amity.Listener<Amity.Models[typeof referenceType]>) => Amity.Unsubscriber;
