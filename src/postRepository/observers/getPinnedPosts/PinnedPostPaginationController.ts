import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class PinnedPostPaginationController extends PaginationController<
  'pinnedPost',
  Amity.PinnedPostLiveCollection
> {
  async getRequest(queryParams: Amity.PinnedPostLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;

    const { communityId, placement } = params;

    const path = placement
      ? `/api/v1/pinned-posts/communities/${communityId}/${placement}`
      : `/api/v1/pinned-posts/communities/${communityId}`;

    const { data: queryResponse } = await this.http.get<Amity.PinnedPostPayload & Amity.Pagination>(
      path,
    );

    return queryResponse;
  }
}
