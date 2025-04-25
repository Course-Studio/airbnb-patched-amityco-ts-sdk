/* eslint-disable no-use-before-define */

import { PaginationController } from '~/core/liveCollection/PaginationController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class ChannelMemberPaginationController extends PaginationController<
  'channelUser',
  Amity.ChannelMembersLiveCollection
> {
  async getRequest(queryParams: Amity.ChannelMembersLiveCollection, token: string | undefined) {
    const { limit = COLLECTION_DEFAULT_PAGINATION_LIMIT, includeDeleted, ...params } = queryParams;
    const options = token ? { token } : { limit };

    const isDeleted = includeDeleted === false ? false : undefined;

    const { data: queryResponse } = await this.http.get<
      Amity.ChannelMembershipPayload & Amity.Pagination
    >(`/api/v4/channels/${encodeURIComponent(params.channelId)}/users`, {
      params: {
        ...params,
        options,
        isDeleted,
      },
    });
    return queryResponse;
  }
}
