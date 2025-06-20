import { date, user11, user12, user13, user14 } from '.';

const timeStamps: Amity.Timestamps = {
  createdAt: date,
  updatedAt: date,
};

// Follow status for user11 to {{ blockUser }}
export const generateFollows = (
  blockUser: Amity.InternalUser,
  status: Exclude<Amity.FollowStatusType, 'all'>,
): Amity.FollowStatus => {
  return {
    ...timeStamps,
    status,
    from: user11.userId,
    to: blockUser.userId,
  };
};

// user11 follows user12
export const follow11: Amity.FollowStatus = {
  ...timeStamps,
  to: user12.userId,
  status: 'accepted',
  from: user11.userId,
};

// user11 pineding user13
export const follow12: Amity.FollowStatus = {
  ...timeStamps,
  status: 'pending',
  to: user13.userId,
  from: user11.userId,
};

// user14 declined user11
export const follow13: Amity.FollowStatus = {
  ...timeStamps,
  status: 'none',
  to: user14.userId,
  from: user11.userId,
};

// user12 follows user11
export const follow21: Amity.FollowStatus = {
  ...timeStamps,
  status: 'accepted',
  to: user11.userId,
  from: user12.userId,
};

// user13 pineding user11
export const follow22: Amity.FollowStatus = {
  ...timeStamps,
  status: 'pending',
  to: user11.userId,
  from: user13.userId,
};

// user11 declined user14
export const follow23: Amity.FollowStatus = {
  ...timeStamps,
  status: 'none',
  to: user11.userId,
  from: user14.userId,
};

export const follows = {
  userId: user11.userId,
  page1: [follow11, follow12, follow13],
  page2: [follow21, follow22, follow23],
};

export const followPayload: Amity.FollowersPayload = {
  users: [user11, user12],
  files: [],
  follows: [follow11, follow12],
};
