import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';
import { inferIsDeleted } from '~/utils/inferIsDeleted';

export class CommentPaginationController extends PaginationController<
  'comment',
  Amity.CommentLiveCollection
> {
  async getRequest(queryParams: Amity.CommentLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, includeDeleted, ...params } = queryParams;

    const baseOptions = {
      type: params.sortBy || queryParams.limit ? 'pagination' : undefined,
    };

    const options = token ? { ...baseOptions, token } : { ...baseOptions, limit };

    const { data: queryResponse } = await this.http.get<Amity.CommentPayload & Amity.Pagination>(
      `/api/v3/comments`,
      {
        params: {
          ...params,
          isDeleted: inferIsDeleted(includeDeleted),
          options,
        },
      },
    );
    return queryResponse;
  }
}
