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
    /**
     * ```js
     * import { notificationTray } from '@amityco/ts-sdk'
     * const notificationTraySeen = await notificationTray.getNotificationTraySeen.locally()
     * ```
     *
     * Queries a paginable list of {@link Amity.NotificationTraySeen} objects from cache
     *
     * @returns A page of {@link Amity.NotificationTraySeen} objects
     *
     * @category NotificationTray API
     * @async
     * */
    locally(): Amity.Cached<Amity.InternalNotificationTraySeen> | undefined;
};
