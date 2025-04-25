/**
 * Get notification tray items for a notification tray page
 *
 * @param params the limit query parameters
 * @param callback the callback to be called when the notification tray items are updated
 * @returns items in the notification tray
 *
 * @category Notification tray items Live Collection
 *
 */
export declare const getNotificationTrayItems: (params: Amity.LiveCollectionParams<Amity.NotificationTrayItemLiveCollection>, callback: Amity.LiveCollectionCallback<Amity.NotificationTrayItem>, config?: Amity.LiveCollectionConfig) => () => void;
