import { getActiveClient } from '~/client';
import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class BlockedUserPaginationController extends PaginationController<
  'blockUser',
  Amity.BlockedUsersLiveCollection
> {
  async getRequest(queryParams: Amity.BlockedUsersLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<
      Amity.BlockedUserPayload & Amity.Pagination
    >('/api/v4/me/user-blocks', {
      params: {
        ...params,
        options,
        isDeleted: false,
      },
    });
    return queryResponse;
  }
}
