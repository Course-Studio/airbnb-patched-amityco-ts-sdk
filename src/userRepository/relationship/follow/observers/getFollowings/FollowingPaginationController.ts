import { getActiveClient } from '~/client';
import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class FollowingPaginationController extends PaginationController<
  'follower',
  Amity.FollowingLiveCollection
> {
  async getRequest(queryParams: Amity.FollowingLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, userId, ...params } = queryParams;
    const options = token ? { token } : { limit };
    const client = getActiveClient();

    const path =
      client.userId === userId ? `/api/v4/me/following` : `/api/v4/users/${userId}/following`;

    const { data: queryResponse } = await this.http.get<Amity.FollowingsPayload & Amity.Pagination>(
      path,
      {
        params: {
          ...params,
          options,
          isDeleted: false,
        },
      },
    );
    return queryResponse;
  }
}
