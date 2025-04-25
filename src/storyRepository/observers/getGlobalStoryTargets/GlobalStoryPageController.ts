import { PaginationController } from '~/core/liveCollection/PaginationController';

type GlobalStoryFeedResult = Amity.GlobalStoryFeedPayload & Amity.Pagination;

const mergeResult = (
  resultA: GlobalStoryFeedResult,
  resultB: GlobalStoryFeedResult,
): GlobalStoryFeedResult => {
  return {
    categories: resultA.categories.concat(resultB.categories),
    communities: resultA.communities.concat(resultB.communities),
    communityUsers: resultA.communityUsers.concat(resultB.communityUsers),
    files: resultA.files.concat(resultB.files),
    storyTargets: resultA.storyTargets.concat(resultB.storyTargets),
    users: resultA.users.concat(resultB.users),
    paging: resultB.paging,
  };
};

const addFlagLocalFilter = (
  payload: GlobalStoryFeedResult,
  filter: Amity.StorySeenQuery,
): GlobalStoryFeedResult => {
  return {
    ...payload,
    storyTargets: payload.storyTargets.map(item => ({ ...item, localFilter: filter })) || [],
  };
};

export class GlobalStoryPageController extends PaginationController<
  'globalStoryFeed',
  Amity.LiveCollectionParams<Amity.StoryGlobalQuery>
> {
  private smartFilterState = Amity.StorySeenQuery.UNSEEN;

  async getRequest(
    queryParams: Amity.LiveCollectionParams<Amity.StoryGlobalQuery>,
    token: string | undefined,
  ) {
    // Apply default values for parameters
    const { limit = 10, seenState = Amity.StorySeenQuery.UNSEEN } = queryParams;

    const result = await this.createRequest({
      seenState: seenState === Amity.StorySeenQuery.SMART ? this.smartFilterState : seenState,
      limit,
      token,
    });

    // Use Early return to reduce condition complexity
    if (result.paging?.next) return result;
    if (seenState !== Amity.StorySeenQuery.SMART) return result;
    if (this.smartFilterState === Amity.StorySeenQuery.SEEN) return result;

    this.smartFilterState = Amity.StorySeenQuery.SEEN;
    const additionalResult = await this.createRequest({
      seenState: this.smartFilterState,
      limit,
    });

    return mergeResult(result, additionalResult);
  }

  async createRequest(params: { seenState: Amity.StorySeenQuery; limit: number; token?: string }) {
    const { data: queryResponse } = await this.http.get<GlobalStoryFeedResult>(
      '/api/v5/me/global-story-targets',
      {
        params,
      },
    );

    return addFlagLocalFilter(queryResponse, params.seenState);
  }
}
