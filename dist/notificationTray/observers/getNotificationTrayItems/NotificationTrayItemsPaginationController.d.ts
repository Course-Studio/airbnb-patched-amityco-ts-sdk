import { PaginationController } from '~/core/liveCollection/PaginationController';
/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export declare class NotificationTrayItemsPaginationController extends PaginationController<'notificationTrayItem', Amity.NotificationTrayItemLiveCollection> {
    getRequest(queryParams: Amity.NotificationTrayItemLiveCollection, token: string | undefined): Promise<Amity.NotificationTrayPayload & Amity.Pagination>;
}
//# sourceMappingURL=NotificationTrayItemsPaginationController.d.ts.map