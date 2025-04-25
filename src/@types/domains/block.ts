export {};

declare global {
  namespace Amity {
    type QueryBlockedUser = {
      token?: Amity.Token;
      limit?: Amity.PageLimit['limit'];
    };

    type BlockedUserPaged = {
      paging: Amity.Pagination['paging'] & { total: number };
    };

    type BlockedUsersLiveCollection = Amity.LiveCollectionParams<QueryBlockedUser>;

    type BlockedUserLiveCollectionCache = Amity.LiveCollectionCache<
      Amity.InternalUser['userId'],
      {
        page: Amity.Page;
        total: number;
      }
    >;
  }
}
