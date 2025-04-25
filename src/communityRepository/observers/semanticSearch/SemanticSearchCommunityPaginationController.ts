import { AmityCommunityMemberStatusFilter } from '~/communityRepository/constants';
import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class SemanticSearchCommunityPaginationController extends PaginationController<
  'semanticSearchCommunity',
  Amity.SemanticSearchCommunityLiveCollection
> {
  async getRequest(
    queryParams: Amity.SemanticSearchCommunityLiveCollection,
    token: string | undefined,
  ) {
    const {
      limit = COLLECTION_DEFAULT_PAGINATION_LIMIT,
      communityMembershipStatus,
      ...params
    } = queryParams;

    const baseOptions = {
      type: queryParams.limit ? 'pagination' : undefined,
    };

    const options = token ? { ...baseOptions, token } : { ...baseOptions, limit };

    const { data: queryResponse } = await this.http.get<
      Amity.SemanticSearchCommunityPayload & Amity.Pagination
    >(`/api/v1/semantic-search/communities`, {
      params: {
        ...params,
        filter: communityMembershipStatus ?? AmityCommunityMemberStatusFilter.ALL,
        options,
      },
    });
    return queryResponse;
  }
}
