import { addPostSetting } from '~/communityRepository/utils';
import { updateMembershipStatus } from '~/communityRepository/utils/communityWithMembership';

export const preparePostPayload = (payload: Amity.PostPayload): Amity.ProcessedPostPayload => {
  const { posts: postsData, ...postPayload } = payload;

  // Unpack community payload by mapping payload field to postSetting value.
  const communitiesWithPostSetting = addPostSetting({ communities: postPayload.communities });

  // map users with community
  const mappedCommunityUsers: Array<Amity.Membership<'community'>> = postPayload.communityUsers.map(
    communityUser => {
      const user = postPayload.users.find(user => user.userId === communityUser.userId)!;

      return {
        ...communityUser,
        user,
      };
    },
  );

  const communityWithMembershipStatus = updateMembershipStatus(
    communitiesWithPostSetting,
    mappedCommunityUsers,
  );

  // feed type
  const posts = postsData.map(post => {
    const feedType = postPayload.feeds.find(feed => feed.feedId === post.feedId)?.feedType;

    return {
      ...post,
      feedType,
    };
  });

  return {
    ...postPayload,
    posts,
    communities: communityWithMembershipStatus,
    communityUsers: mappedCommunityUsers,
  };
};

export const prepareSemanticSearchPostPayload = ({
  searchResult,
  polls,
  ...postPayload
}: Amity.SemanticSearchPostPayload): Amity.ProcessedSemanticSearchPostPayload => {
  const processedPostPayload = preparePostPayload(postPayload);

  return {
    ...processedPostPayload,
    polls,
  };
};
