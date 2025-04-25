/**
 * ```js
 * import { notificationTray } from '@amityco/ts-sdk'
 * const notificationTraySeen = await notificationTray.getNotificationTraySeen()
 * ```
 *
 *
 * @returns A page of {@link Amity.NotificationTraySeen} objects
 *
 * @category NotificationTray API
 * @async
 * */
export declare const getNotificationTraySeen: {
    (): Promise<Amity.Cached<Amity.InternalNotificationTraySeen>>;
    locally(): Amity.Cached<Amity.InternalNotificationTraySeen> | undefined;
};
