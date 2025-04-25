import { getActiveClient } from '~/client';
import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';
import { REFERENCE_API_V5 } from '~/reactionRepository/api/constants';
import { ASCApiError } from '~/core/errors';

export class ReactionPaginationController extends PaginationController<
  'reaction',
  Amity.ReactionLiveCollection
> {
  async getRequest(queryParams: Amity.ReactionLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;
    const options = token ? { token } : { limit };
    const client = getActiveClient();
    client.log('reaction/queryReactions', queryParams);

    const path = '/api/v3/reactions';

    if (!['post', 'comment', 'story', 'message'].includes(params.referenceType))
      throw new ASCApiError(
        'The reference type is not valid. It should be one of post, comment, story, or message',
        Amity.ServerError.BAD_REQUEST,
        Amity.ErrorLevel.ERROR,
      );

    const { data: queryResponse } = await this.http.get<Amity.ReactionPayload & Amity.Pagination>(
      path,
      {
        params: {
          ...params,
          referenceVersion: REFERENCE_API_V5, // Need to put this param to make it can query reaction for message in sub-channel
          options,
        },
      },
    );
    return queryResponse;
  }
}
