import { DefaultCommunityPostSetting } from '~/@types';

import { baseMembership, date, user11, user12, file11, user13, user14 } from '.';

function convertCommunityUserFromRaw(
  member: Amity.RawMembership<'community'>,
  user: Amity.InternalUser,
): Amity.Membership<'community'> {
  return {
    ...member,
    user,
  };
}

const mockPage: Amity.Pagination = {
  paging: {
    previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
    next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
  },
};

export const baseCommunity: Amity.Community = {
  categoryIds: [],
  channelId: '',
  communityId: '',
  createdAt: '',
  displayName: '',
  hasFlaggedComment: false,
  hasFlaggedPost: false,
  membersCount: 0,
  path: '',
  postsCount: 0,
  userId: '',
  postSetting: DefaultCommunityPostSetting,
};

export const community11: Amity.Community = {
  ...baseCommunity,
  isOfficial: false,
  isPublic: true,
  postsCount: 7,
  membersCount: 1,
  updatedAt: '2022-10-31T05:06:57.999Z',
  createdAt: '2022-10-31T02:48:34.978Z',
  isDeleted: false,
  displayName: 'HardDelete1',
  tags: [],
  metadata: {},
  hasFlaggedComment: false,
  hasFlaggedPost: true,
  communityId: 'community11',
  channelId: '635f3782064bf304f786707d',
  userId: user11.userId,
  isJoined: false,
  avatarFileId: undefined,
  categoryIds: [],
};

export const community21: Amity.Community = {
  ...baseCommunity,
  communityId: 'community21',
  displayName: 'Community21',
};

export const communityUser11: Amity.RawMembership<'community'> = {
  ...baseMembership,
  communityMembership: 'member',
  lastActivity: '2022-10-25T11:10:13.048Z',
  updatedAt: '2022-10-25T11:10:13.048Z',
  createdAt: '2022-10-25T11:10:13.048Z',
  muteTimeout: '2022-10-25T11:10:13.048Z',
  isMuted: false,
  isBanned: false,
  userId: 'test',
  communityId: community11.communityId,
  roles: ['channel-moderator', 'community-moderator'],
  permissions: [Amity.Permission.CreateRolePermission],
};

export const convertedCommunityUser1 = convertCommunityUserFromRaw(communityUser11, user11);

export const communityUser12: Amity.RawMembership<'community'> = {
  ...baseMembership,
  createdAt: date,
  lastActivity: date,
  userId: user12.userId,
  communityId: community11.communityId,
  communityMembership: 'member',
};

export const convertedCommunityUser2 = convertCommunityUserFromRaw(communityUser12, user12);

export const communityUser13: Amity.RawMembership<'community'> = {
  ...baseMembership,
  createdAt: date,
  lastActivity: date,
  userId: user13.userId,
  communityId: community11.communityId,
  communityMembership: 'member',
};

export const convertedCommunityUser3 = convertCommunityUserFromRaw(communityUser13, user13);

export const communityUser21: Amity.RawMembership<'community'> = {
  ...baseMembership,
  userId: user13.userId,
  roles: ['test-role'],
  communityId: community21.communityId,
  communityMembership: 'member',
};

export const withRoleCommunityUser = convertCommunityUserFromRaw(communityUser21, user13);

export const communityUser22: Amity.RawMembership<'community'> = {
  ...baseMembership,
  userId: user14.userId,
  communityId: community21.communityId,
  communityMembership: 'banned',
};

export const bannedCommunityUser = convertCommunityUserFromRaw(communityUser22, user14);

export const emptyCommunityPayload = {
  communities: [],
  communityUsers: [],
  categories: [],
  feeds: [],
  users: [],
  files: [],
};

export const communityPayload: Amity.CommunityPayload = {
  communities: [community11],
  communityUsers: [communityUser11],
  files: [file11],
  users: [user11],
  categories: [],
  feeds: [],
};

export const communityUserQueryResponse = {
  data: {
    communities: [community11],
    communityUsers: [communityUser11, communityUser12],
    users: [user11, user12],
    files: [],
    categories: [],
    feeds: [],
    ...mockPage,
  },
};

export const communityUserQueryResponsePage2 = {
  data: {
    communities: [community11],
    communityUsers: [communityUser21, communityUser22],
    users: [user13, user14],
    files: [],
    categories: [],
    feeds: [],
    ...mockPage,
  },
};

export const communityUserModel = [
  { ...communityUser11, user: user11 },
  { ...communityUser12, user: user12 },
];

export const communityRaw1 = {
  path: '631f16be1e440400da5663b0/social/community/63c8e023d2474637568ece5e',
  isOfficial: false,
  isPublic: true,
  onlyAdminCanPost: false,
  postsCount: 0,
  membersCount: 1,
  moderatorMemberCount: 1,
  updatedAt: '2023-01-19T06:16:03.818Z',
  createdAt: '2023-01-19T06:16:03.818Z',
  isDeleted: true,
  needApprovalOnPostCreation: false,
  displayName: 'community 1',
  tags: ['test-community-tag'],
  metadata: {},
  hasFlaggedComment: false,
  hasFlaggedPost: true,
  communityId: '63c8e023d2474637568ece5e',
  channelId: '63c8e023d2474637568ece5e',
  userId: user11.userId,
  isJoined: true,
  avatarFileId: '',
  categoryIds: ['test-category-id'],
};

export const communityRaw2 = {
  path: '631f16be1e440400da5663b0/social/community/63c8cd098309f85d2ec7dad7',
  isOfficial: false,
  isPublic: true,
  onlyAdminCanPost: false,
  postsCount: 0,
  membersCount: 1,
  moderatorMemberCount: 1,
  updatedAt: '2023-01-19T04:54:57.078Z',
  createdAt: '2023-01-19T04:54:33.716Z',
  isDeleted: false,
  needApprovalOnPostCreation: false,
  displayName: 'new community ....1',
  tags: [],
  metadata: {},
  hasFlaggedComment: false,
  hasFlaggedPost: false,
  communityId: '63c8cd098309f85d2ec7dad7',
  channelId: '63c8cd098309f85d2ec7dad7',
  userId: user12.userId,
  isJoined: false,
  avatarFileId: '',
  categoryIds: [],
};

export const communityQueryResponse = {
  data: {
    communities: [communityRaw1, communityRaw2],
    communityUsers: [communityUser11],
    categories: [
      {
        name: '$testing category',
        metadata: {},
        updatedAt: '2022-11-25T03:56:06.238Z',
        createdAt: '2022-11-25T03:56:06.238Z',
        isDeleted: false,
        categoryId: '88d175da65cbfeb39b81e722b322430d',
      },
    ],
    users: [user11, user12],
    feeds: [],
    files: [],
    paging: {
      next: 'eyJza2lwIjoxMCwibGltaXQiOjEwfQ==',
    },
  } as Amity.CommunityPayload & Amity.Pagination,
};

export const communityQueryResponsePage2 = {
  data: {
    communities: [communityRaw1],
    communityUsers: [communityUser11],
    categories: [
      {
        name: '$testing category',
        metadata: {},
        updatedAt: '2022-11-25T03:56:06.238Z',
        createdAt: '2022-11-25T03:56:06.238Z',
        isDeleted: false,
        categoryId: '88d175da65cbfeb39b81e722b322430d',
      },
    ],
    users: [user11, user12],
    feeds: [],
    files: [],
    paging: {
      next: 'eyJza2lwIjoxMCwibGltaXQiOjEwfQ==',
    },
  } as Amity.CommunityPayload & Amity.Pagination,
};
