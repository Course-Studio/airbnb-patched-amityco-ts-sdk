import { createUserEventSubscriber } from './utils';

/**
 * ```js
 * import { onUserDeleted } from '@amityco/ts-sdk'
 * const dispose = onUserDeleted(user => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalUser} has been deleted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category User Events
 */
export const onUserDeleted = (callback: Amity.Listener<Amity.InternalUser>) =>
  createUserEventSubscriber('user.deleted', callback);
