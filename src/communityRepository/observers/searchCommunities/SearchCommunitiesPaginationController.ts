import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';
import { inferIsDeleted } from '~/utils/inferIsDeleted';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class CommunitiesPaginationController extends PaginationController<
  'community',
  Amity.SearchCommunityLiveCollection
> {
  async getRequest(queryParams: Amity.SearchCommunityLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<Amity.CommunityPayload & Amity.Pagination>(
      `/api/v3/communities`,
      {
        params: {
          ...params,
          isDeleted: inferIsDeleted(params.includeDeleted),
          keyword: params.displayName,
          filter: params.membership,
          options,
        },
      },
    );
    return queryResponse;
  }
}
