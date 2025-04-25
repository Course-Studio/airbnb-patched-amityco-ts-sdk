import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class UserPaginationController extends PaginationController<
  'user',
  Amity.UserLiveCollection
> {
  async getRequest(queryParams: Amity.UserLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<Amity.UserPayload & Amity.Pagination>(
      `/api/v3/users`,
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
