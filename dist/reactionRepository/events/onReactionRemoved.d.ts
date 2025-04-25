/**
 * ```js
 * import { onReactionRemoved } from '@amityco/ts-sdk'
 * const dispose = onReactionRemoved('post', postId, post => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Reaction} has been removed
 *
 * @param {@link Amity.ReactableType} referenceType
 * @param {string} referenceId
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 * */
export declare const onReactionRemoved: (referenceType: Amity.ReactableType, referenceId: Amity.Reaction['referenceId'], callback: Amity.Listener<Amity.InternalMessage<any> | Amity.InternalPost<any> | Amity.InternalComment<any> | Amity.InternalStory>) => Amity.Unsubscriber;
