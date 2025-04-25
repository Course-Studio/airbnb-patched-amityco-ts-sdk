import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class SearchUserPaginationController extends PaginationController<
  'user',
  Amity.SearchUserLiveCollection
> {
  async getRequest(queryParams: Amity.SearchUserLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, displayName, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<Amity.UserPayload & Amity.Pagination>(
      `/api/v3/users`,
      {
        params: {
          ...params,
          keyword: displayName,
          options,
          isDeleted: false,
        },
      },
    );
    return queryResponse;
  }
}
