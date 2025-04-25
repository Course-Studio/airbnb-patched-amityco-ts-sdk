export {};

declare global {
  namespace Amity {
    // Raw response from BE, not contain all linked objects
    type PinnedPostPayload<T extends Amity.PostContentType = any> = {
      pinTargets: Amity.RawPinTarget[];
      pins: Amity.RawPin[];
      posts: Amity.RawPost<T>[];
      postChildren: Amity.RawPost<T>[];
      comments: Amity.RawComment[];
      videoStreamings: Amity.RawStream[];
      polls: Amity.RawPoll[];
    } & Amity.CommunityPayload;

    type PinnedPostLiveCollection = Amity.LiveCollectionParams<{
      communityId: Amity.Community['communityId'];
      placement?: string | null;
      sortBy: 'lastPinned' | 'lastCreated';
    }>;

    type PinnedPostLiveCollectionCache = Omit<
      Amity.LiveCollectionCache<Amity.InternalPin['referenceId'], Amity.Page>,
      'params'
    >;

    type PinnedPost = {
      post: Amity.Post | undefined;
      placement: Amity.Pin['placement'];
      target: Amity.PinTarget | undefined;
      pinnedBy: Amity.User;
      pinnedAt: Date;
    };

    type GlobalPinnedPostLiveCollection = Amity.LiveCollectionParams<Record<string, never>>;
  }
}
