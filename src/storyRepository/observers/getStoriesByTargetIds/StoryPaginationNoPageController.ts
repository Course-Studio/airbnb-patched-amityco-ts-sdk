import { PaginationNoPageController } from '~/core/liveCollection/PaginationNoPageController';

export class StoryPaginationNoPageController extends PaginationNoPageController<
  'story',
  Pick<Amity.StoryLiveCollection, 'targets'>
> {
  async getRequest(queryParams: Pick<Amity.StoryLiveCollection, 'targets'>) {
    const { data: queryResponse } = await this.http.get<Amity.StoryPayload>(
      '/api/v4/stories-by-targets',
      {
        params: { ...queryParams },
      },
    );
    return queryResponse;
  }
}
