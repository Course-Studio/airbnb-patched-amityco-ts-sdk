import { createPostEventSubscriber } from './utils';

/**
 * ```js
 * import { onPostCreated } from '@amityco/ts-sdk'
 * const dispose = onPostCreated(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalPost} has been created
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export const onPostCreated = (callback: Amity.Listener<Amity.InternalPost>): Amity.Unsubscriber =>
  createPostEventSubscriber('post.created', callback);
