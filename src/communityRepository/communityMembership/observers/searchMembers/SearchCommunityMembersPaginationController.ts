import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class SearchCommunityMembersPaginationController extends PaginationController<
  'communityUser',
  Amity.SearchCommunityMemberLiveCollection
> {
  async getRequest(
    queryParams: Amity.SearchCommunityMemberLiveCollection,
    token: string | undefined,
  ) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, includeDeleted, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const isDeleted = includeDeleted === false ? false : undefined;

    const { data: queryResponse } = await this.http.get<
      Amity.CommunityMembershipPayload & Amity.Pagination
    >(`/api/v3/communities/${params.communityId}/users`, {
      params: {
        ...params,
        options,
        isDeleted,
      },
    });
    return queryResponse;
  }
}
