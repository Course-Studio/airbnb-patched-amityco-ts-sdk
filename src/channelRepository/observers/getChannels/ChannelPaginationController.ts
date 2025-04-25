/* eslint-disable no-use-before-define */

import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class ChannelPaginationController extends PaginationController<
  'channel',
  Amity.ChannelLiveCollection
> {
  async getRequest(queryParams: Amity.ChannelLiveCollection, token: string | undefined) {
    const {
      limit = COLLECTION_DEFAULT_PAGINATION_LIMIT,
      displayName,
      membership,
      ...params
    } = queryParams;
    const options = token ? { token } : { limit };

    const { data: queryResponse } = await this.http.get<Amity.ChannelPayload & Amity.Pagination>(
      `/api/v3/channels`,
      {
        params: {
          ...params,
          keyword: displayName,
          filter: membership,
          options,
        },
      },
    );
    return queryResponse;
  }
}
