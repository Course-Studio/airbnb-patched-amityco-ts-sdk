import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class NotificationTrayItemsPaginationController extends PaginationController<
  'notificationTrayItem',
  Amity.NotificationTrayItemLiveCollection
> {
  async getRequest(
    queryParams: Amity.NotificationTrayItemLiveCollection,
    token: string | undefined,
  ) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;

    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<
      Amity.NotificationTrayPayload & Amity.Pagination
    >(`/api/v1/notification-tray`, {
      params: {
        ...params,
        options,
      },
    });

    return queryResponse;
  }
}
