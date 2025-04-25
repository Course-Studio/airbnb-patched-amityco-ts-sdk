import { createPostEventSubscriber } from './utils';

/**
 * ```js
 * import { onPostApproved } from '@amityco/ts-sdk'
 * const dispose = onPostApproved(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalPost} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export const onPostApproved = (callback: Amity.Listener<Amity.InternalPost>): Amity.Unsubscriber =>
  createPostEventSubscriber('post.approved', callback);
