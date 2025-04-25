/* eslint-disable no-use-before-define */

import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';
import { convertQueryParams } from '~/subChannelRepository/utils';
import { inferIsDeleted } from '~/utils/inferIsDeleted';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class SubChannelPaginationController extends PaginationController<
  'subChannel',
  Amity.SubChannelLiveCollection
> {
  async getRequest(queryParams: Amity.SubChannelLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, ...params } = queryParams;
    const { channelId, includeDeleted, ...restProcessedParams } = convertQueryParams(params) ?? {};

    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<Amity.SubChannelPayload & Amity.Pagination>(
      `/api/v5/message-feeds/channel/${channelId}`,
      {
        params: {
          ...restProcessedParams,
          isDeleted: inferIsDeleted(includeDeleted),
          options,
        },
      },
    );

    return queryResponse;
  }
}
