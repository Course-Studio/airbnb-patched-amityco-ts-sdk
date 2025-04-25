import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class GetStreamsPageController extends PaginationController<
  'stream',
  Amity.StreamLiveCollection
> {
  async getRequest(queryParams: Amity.StreamLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<
      { results: Amity.StreamPayload } & Amity.Pagination
    >(`/api/v3/video-streaming`, {
      params: {
        ...params,
        options,
      },
    });

    return { ...queryResponse.results, paging: queryResponse.paging };
  }
}
