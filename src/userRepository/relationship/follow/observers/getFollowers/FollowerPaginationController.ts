import { getActiveClient } from '~/client';
import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class FollowerPaginationController extends PaginationController<
  'follower',
  Amity.FollowerLiveCollection
> {
  async getRequest(queryParams: Amity.FollowerLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, userId, ...params } = queryParams;
    const options = token ? { token } : { limit };
    const client = getActiveClient();

    const path =
      client.userId === userId ? `/api/v4/me/followers` : `/api/v4/users/${userId}/followers`;

    const { data: queryResponse } = await this.http.get<Amity.FollowersPayload & Amity.Pagination>(
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
