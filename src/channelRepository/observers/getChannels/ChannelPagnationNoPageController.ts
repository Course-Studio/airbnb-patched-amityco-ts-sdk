/* eslint-disable no-use-before-define */

import { PaginationController } from '~/core/liveCollection/PaginationController';
import { PaginationNoPageController } from '~/core/liveCollection/PaginationNoPageController';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

export class ChannelPaginationNoPageController extends PaginationNoPageController<
  'channel',
  Pick<Amity.ChannelLiveCollection, 'channelIds'>
> {
  async getRequest(queryParams: Pick<Amity.ChannelLiveCollection, 'channelIds'>) {
    const { data: queryResponse } = await this.http.get<Amity.ChannelPayload>(
      `/api/v3/channels/list`,
      {
        params: { ...queryParams },
      },
    );
    return queryResponse;
  }
}
