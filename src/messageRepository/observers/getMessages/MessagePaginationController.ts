/* eslint-disable no-use-before-define */

import { PaginationController } from '~/core/liveCollection/PaginationController';
import { convertQueryParams } from '~/messageRepository/utils';

/**
 * TODO: handle cache receive cache option, and cache policy
 * TODO: check if querybyIds is supported
 */
export class MessagePaginationController extends PaginationController<
  'message',
  Amity.MessagesLiveCollection
> {
  async getRequest(queryParams: Amity.MessagesLiveCollection, token: string | undefined) {
    const processedQueryParams = convertQueryParams(queryParams);
    const { data: queryResponse } = await this.http.get<Amity.MessagePayload & Amity.Pagination>(
      `/api/v5/messages`,
      {
        params: {
          ...processedQueryParams,
          options: token
            ? {
                token,
              }
            : {
                ...processedQueryParams.options,
              },
        },
      },
    );
    return queryResponse;
  }
}
