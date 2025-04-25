import { CommunityPostSettingMaps, DefaultCommunityPostSetting } from '~/@types';
import { updateMembershipStatus } from './communityWithMembership';

const getMatchPostSetting = (value: {
  needApprovalOnPostCreation: Amity.RawCommunity['needApprovalOnPostCreation'];
  onlyAdminCanPost: Amity.RawCommunity['onlyAdminCanPost'];
}): Amity.Community['postSetting'] =>
  Object.keys(CommunityPostSettingMaps).find(
    key =>
      value.needApprovalOnPostCreation ===
        CommunityPostSettingMaps[key].needApprovalOnPostCreation &&
      value.onlyAdminCanPost === CommunityPostSettingMaps[key].onlyAdminCanPost,
  ) ?? DefaultCommunityPostSetting;

export function addPostSetting({ communities }: { communities: Amity.RawCommunity[] }) {
  return communities.map<Amity.Community>(
    ({ needApprovalOnPostCreation, onlyAdminCanPost, ...restCommunityPayload }) => ({
      postSetting: getMatchPostSetting({
        needApprovalOnPostCreation,
        onlyAdminCanPost,
      }),
      ...restCommunityPayload,
    }),
  );
}

export const prepareCommunityPayload = (
  rawPayload: Amity.CommunityPayload,
): Amity.ProcessedCommunityPayload => {
  const communitiesWithPostSetting = addPostSetting({ communities: rawPayload.communities });

  // map users with community
  const mappedCommunityUsers: Array<Amity.Membership<'community'>> = rawPayload.communityUsers.map(
    communityUser => {
      const user = rawPayload.users.find(user => user.userId === communityUser.userId)!;

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

  return {
    ...rawPayload,
    communities: communityWithMembershipStatus,
    communityUsers: mappedCommunityUsers,
  };
};

export const prepareCommunityMembershipPayload = (
  rawPayload: Amity.CommunityMembershipPayload,
): Amity.ProcessedCommunityMembershipPayload => {
  const communitiesWithPostSetting = addPostSetting({ communities: rawPayload.communities });

  // map users with community
  const mappedCommunityUsers: Array<Amity.Membership<'community'>> = rawPayload.communityUsers.map(
    communityUser => {
      const user = rawPayload.users.find(user => user.userId === communityUser.userId)!;

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

  return {
    ...rawPayload,
    communities: communityWithMembershipStatus,
    communityUsers: mappedCommunityUsers,
  };
};

export const prepareCommunityRequest = <
  T extends {
    postSetting?: Amity.Community['postSetting'];
    [k: string]: any;
  },
>(
  params: T,
) => {
  const { postSetting = undefined, storySetting, ...restParam } = params;

  return {
    ...restParam,
    // Repack community payload by mapping postSetting to the actual value.
    ...(postSetting ? CommunityPostSettingMaps[postSetting] : undefined),
    // Convert story setting to the actual value. (Allow by default)
    allowCommentInStory:
      typeof storySetting?.enableComment === 'boolean' ? storySetting.enableComment : true,
  };
};

export const prepareSemanticSearchCommunityPayload = ({
  searchResult,
  ...communityPayload
}: Amity.SemanticSearchCommunityPayload): Amity.ProcessedSemanticSearchCommunityPayload => {
  const processedCommunityPayload = prepareCommunityPayload(communityPayload);

  return {
    ...processedCommunityPayload,
  };
};
