import { PaginationNoPageController } from '~/core/liveCollection/PaginationNoPageController';
export declare class StoryPaginationNoPageController extends PaginationNoPageController<'story', Pick<Amity.StoryLiveCollection, 'targets'>> {
    getRequest(queryParams: Pick<Amity.StoryLiveCollection, 'targets'>): Promise<Amity.StoryPayload>;
}
//# sourceMappingURL=StoryPaginationNoPageController.d.ts.map