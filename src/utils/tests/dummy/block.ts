import { generateFollows, user11 } from '~/utils/tests';

export const generateFollowCount = (user: Amity.InternalUser) => {
  return {
    userId: user.userId,
    followingCount: 0,
    followerCount: 0,
    pendingCount: 0,
  };
};

export const generateBlockResult = (
  blockUser: Amity.InternalUser,
  status: Exclude<Amity.FollowStatusType, 'all'>,
) => {
  return {
    data: {
      follows: [generateFollows(blockUser, status)],
      followCounts: [generateFollowCount(user11)],
    },
  };
};

export const generateBlockedUsers = (...blockedUser: Amity.InternalUser[]) => {
  return {
    data: {
      users: blockedUser ?? [],
      files: [],
      follows: blockedUser.map(user => generateFollows(user, 'blocked')) ?? [],
      paging: {
        total: blockedUser.length ?? 0,
      },
    },
  };
};
