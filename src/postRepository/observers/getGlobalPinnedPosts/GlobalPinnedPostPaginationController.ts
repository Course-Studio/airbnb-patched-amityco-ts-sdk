import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class GlobalPinnedPostPaginationController extends PaginationController<
  'pinnedPost',
  Amity.GlobalPinnedPostLiveCollection
> {
  async getRequest(queryParams: Amity.GlobalPinnedPostLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;

    const path = '/api/v1/pinned-posts/global';

    const { data: queryResponse } = await this.http.get<Amity.PinnedPostPayload & Amity.Pagination>(
      path,
    );

    return queryResponse;
  }
}
