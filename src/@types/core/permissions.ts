export {};

declare global {
  namespace Amity {
    const enum Permission {
      EditUserPermission = 'EDIT_USER',
      BanUserPermission = 'BAN_USER',
      CreateRolePermission = 'CREATE_ROLE',
      EditRolePermission = 'EDIT_ROLE',
      DeleteRolePermission = 'DELETE_ROLE',
      AssignRolePermission = 'ASSIGN_USER_ROLE',
      EditChannelPermission = 'EDIT_CHANNEL',
      EditChannelRatelimitPermission = 'EDIT_CHANNEL_RATELIMIT',
      MuteChannelPermission = 'MUTE_CHANNEL',
      CloseChannelPermission = 'CLOSE_CHANNEL',
      AddChannelUserPermission = 'ADD_CHANNEL_USER',
      EditChannelUserPermission = 'EDIT_CHANNEL_USER',
      RemoveChannelUserPermission = 'REMOVE_CHANNEL_USER',
      MuteChannelUserPermission = 'MUTE_CHANNEL_USER',
      BanChannelUserPermission = 'BAN_CHANNEL_USER',
      EditMessagePermission = 'EDIT_MESSAGE',
      DeleteMessagePermission = 'DELETE_MESSAGE',
      EditCommunityPermission = 'EDIT_COMMUNITY',
      DeleteCommunityPermission = 'DELETE_COMMUNITY',
      AddChannelCommunityPermission = 'ADD_COMMUNITY_USER',
      EditChannelCommunityPermission = 'EDIT_COMMUNITY_USER',
      RemoveChannelCommunityPermission = 'REMOVE_COMMUNITY_USER',
      MuteChannelCommunityPermission = 'MUTE_COMMUNITY_USER',
      BanChannelCommunityPermission = 'BAN_COMMUNITY_USER',
      EditUserFeedPostPermission = 'EDIT_USER_FEED_POST',
      DeleteUserFeedPostPermission = 'DELETE_USER_FEED_POST',
      EditUserFeedCommentPermission = 'EDIT_USER_FEED_COMMENT',
      DeleteUserFeedCommentPermission = 'DELETE_USER_FEED_COMMENT',
      EditCommunityFeedPostPermission = 'EDIT_COMMUNITY_POST',
      DeleteCommunityFeedPostPermission = 'DELETE_COMMUNITY_POST',
      EditCommunityFeedCommentPermission = 'EDIT_COMMUNITY_COMMENT',
      DeleteCommunityFeedCommentPermission = 'DELETE_COMMUNITY_COMMENT',
      CreateCommunityCategoryPermission = 'CREATE_COMMUNITY_CATEGORY',
      EditCommunityCategoryPermission = 'EDIT_COMMUNITY_CATEGORY',
      DeleteCommunityCategoryPermission = 'DELETE_COMMUNITY_CATEGORY',
      ManageStoryPermission = 'MANAGE_COMMUNITY_STORY',
      CreatePrivillegedPostPermission = 'CREATE_PRIVILEGED_POST',
    }

    const enum PermissionLegacy {
      ModeratorRoleLegacy = 'moderator',
      SuperModeratorRoleLegacy = 'super-moderator',
      GlobalAdminRoleLegacy = 'global-admin',
      BanUserPermissionLegacy = 'Channel/BanUser',
      MuteUserPermissionLegacy = 'Channel/MuteUser',
      MuteChannelPermissionLegacy = 'Channel/MuteChannel',
      RateLimitUserPermissionLegacy = 'Channel/RateLimitUser',
      RateLimitChannelPermissionLegacy = 'Channel/RateLimitChannel',
      ManageMessagesPermissionLegacy = 'Channel/ManageMessages',
      ManageUsersPermissionLegacy = 'Channel/ManageUsers',
      GlobalAccessPermissionLegacy = 'Channel/GlobalAccess',
      ExemptFromFiltersPermissionLegacy = 'User/ExemptFromFilters',
      ExemptFromRateLimitsPermissionLegacy = 'User/ExemptFromRateLimits',
      ExemptFromMutePermissionLegacy = 'User/ExemptFromMute',
      ExemptFromBanPermissionLegacy = 'User/ExempFromBan',
      ExemptFromWhitelistPermissionLegacy = 'User/ExempFromWhitelist',
      ExemptFromBlacklistPermissionLegacy = 'User/ExempFromBlacklist',
      ExemptFromRepetitionCheckPermissionLegacy = 'User/ExempFromRepetitionCheck',
      ManagePostsPermissionLegacy = 'Post/ManagePosts',
      ManageCommentsPermissionLegacy = 'Post/ManageComments',
      ManageCommunitiesPermissionLegacy = 'Community/ManageCommunities',
    }

    type Role = {
      roleId: string;
      displayName: string;
      permissions: Permission[];
    } & Amity.Timestamps &
      Amity.SoftDelete;

    type PermissionChecker = {
      community: (communityId: Amity.Community['communityId']) => boolean;
      channel: (channelId: Amity.Channel['channelId']) => boolean;
      currentUser: () => boolean;
    };
  }
}
