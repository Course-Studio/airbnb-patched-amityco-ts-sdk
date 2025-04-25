import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';
import { inferIsDeleted } from '~/utils/inferIsDeleted';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class TrendingCommunitiesPaginationController extends PaginationController<
  'community',
  Amity.TrendingCommunityLiveCollection
> {
  async getRequest(queryParams: Amity.TrendingCommunityLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<Amity.CommunityPayload & Amity.Pagination>(
      `/api/v3/communities/top-trending`,
      {
        params: {
          ...params,
          options,
        },
      },
    );
    return queryResponse;
  }
}
