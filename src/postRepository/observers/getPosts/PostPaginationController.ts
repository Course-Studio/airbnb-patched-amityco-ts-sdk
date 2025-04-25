import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';
import { inferIsDeleted } from '~/utils/inferIsDeleted';

export class PostPaginationController extends PaginationController<
  'post',
  Amity.PostLiveCollection
> {
  async getRequest(queryParams: Amity.PostLiveCollection, token: string | undefined) {
    const {
      limit = COLLECTION_DEFAULT_PAGINATION_LIMIT,
      includeDeleted,
      matchingOnlyParentPost,
      ...params
    } = queryParams;

    const { dataTypes } = params;

    const baseOptions = {
      type: params.sortBy || queryParams.limit ? 'pagination' : undefined,
    };

    const options = token ? { ...baseOptions, token } : { ...baseOptions, limit };

    const { data: queryResponse } = await this.http.get<Amity.PostPayload & Amity.Pagination>(
      `/api/v4/posts`,
      {
        params: {
          ...params,
          isDeleted: inferIsDeleted(includeDeleted),
          /*
           * when creating post like image, file, video BE will create 2 posts
           * 1. parent post to store text with dataType=text
           * 2. child post to store dataTypes post data
           *
           * By default, BE queries only parent post
           */
          matchingOnlyParentPost: matchingOnlyParentPost ?? !dataTypes?.length,
          options,
        },
      },
    );
    return queryResponse;
  }
}
