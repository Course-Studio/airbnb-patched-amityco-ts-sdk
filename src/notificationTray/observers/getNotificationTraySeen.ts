import { liveObject } from '~/utils/liveObject';
import { getNotificationTraySeen as _getNotificationTraySeen } from '../internalApi/getNotificationTraySeen';
import { onNotificationTraySeenUpdated } from '../events/onNotificationTraySeenUpdated';
import { getActiveUser } from '~/client';
import { convertDateStringToTimestamp } from '~/utils/dateTime';

/* begin_public_function
  id: notificationTray.getNotificationTraySeen
*/
/**
 * ```js
 * import { notificationTray } from '@amityco/ts-sdk';
 *
 * let notificationTraySeen;
 *
 * const unsubscribe = getNotificationTraySeen(response => {
 *   notificationTraySeen = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.NotificationTraySeen}
 *
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the message
 *
 * @category NotificationTraySeen Live Object
 */
export const getNotificationTraySeen = (
  callback: Amity.LiveObjectCallback<Amity.NotificationTraySeen>,
): Amity.Unsubscriber => {
  const { userId } = getActiveUser();
  return liveObject(
    userId,
    callback,
    'userId',
    _getNotificationTraySeen,
    [onNotificationTraySeenUpdated],
    {
      callbackDataSelector: (data: Amity.InternalNotificationTraySeen) => {
        let isSeen = true;

        if (data?.lastTrayOccurredAt) {
          if (!data.lastTraySeenAt) {
            isSeen = false;
          } else {
            isSeen =
              convertDateStringToTimestamp(data.lastTraySeenAt) >
              convertDateStringToTimestamp(data.lastTrayOccurredAt);
          }
        }
        return {
          lastTrayOccurredAt: data?.lastTrayOccurredAt,
          lastTraySeenAt: data?.lastTraySeenAt,
          isSeen,
        };
      },
    },
  );
};
/* end_public_function */
