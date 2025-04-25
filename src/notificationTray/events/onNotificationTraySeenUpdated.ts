import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onNotificationTraySeenUpdated } from '@amityco/ts-sdk'
 * const dispose = onNotificationTraySeenUpdated(data => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.NotificationTraySeen} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category NotificationTraySeen Events
 */
export const onNotificationTraySeenUpdated = (
  callback: Amity.Listener<Amity.InternalNotificationTraySeen>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const disposers = [
    createEventSubscriber(
      client,
      'onNotificationTraySeenUpdated',
      'local.notificationTraySeen.updated',
      payload => callback(payload),
    ),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
