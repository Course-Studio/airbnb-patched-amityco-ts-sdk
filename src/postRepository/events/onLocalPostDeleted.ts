import { createLocalPostEventSubscriber, createPostEventSubscriber } from './utils';

/**
 * ```js
 * import { onLocalPostDeleted } from '@amityco/ts-sdk'
 * const dispose = onLocalPostDeleted(post => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalPost} has been deleted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export const onLocalPostDeleted = (
  callback: Amity.Listener<Amity.InternalPost>,
): Amity.Unsubscriber => createLocalPostEventSubscriber('local.post.deleted', callback);
