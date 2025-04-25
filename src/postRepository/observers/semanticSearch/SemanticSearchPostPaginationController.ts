import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class SemanticSearchPostPaginationController extends PaginationController<
  'semanticSearchPost',
  Amity.SemanticSearchPostLiveCollection
> {
  async getRequest(queryParams: Amity.SemanticSearchPostLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;

    const baseOptions = {
      type: queryParams.limit ? 'pagination' : undefined,
    };

    const options = token ? { ...baseOptions, token } : { ...baseOptions, limit };

    const { data: queryResponse } = await this.http.get<
      Amity.SemanticSearchPostPayload & Amity.Pagination
    >(`/api/v1/semantic-search/posts`, {
      params: {
        ...params,
        options,
      },
    });
    return queryResponse;
  }
}
