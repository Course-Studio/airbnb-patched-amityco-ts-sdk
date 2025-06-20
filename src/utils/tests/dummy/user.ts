import { date, rolesAndPermissions } from '.';

export const user11: Amity.User = {
  _id: '',
  path: '',
  flagCount: 0,
  userId: 'test',
  hashFlag: null,
  createdAt: date,
  updatedAt: date,
  isGlobalBanned: false,
  avatar: null,
  ...rolesAndPermissions,
};

export const user12: Amity.User = {
  ...user11,
  userId: 'user2',
};

export const user13: Amity.User = {
  ...user11,
  userId: 'user3',
};

export const user14: Amity.User = {
  ...user11,
  userId: 'user4',
};

export const user21: Amity.User = {
  ...user11,
  displayName: 'displayName',
  userId: 'user21',
};

export const user22: Amity.User = {
  ...user11,
  userId: 'user22',
};

export const viewedUserQueryResponse = {
  data: {
    users: [user11, user12],
    files: [],
    paging: {},
  },
};

export const userQueryResponse = {
  data: {
    users: [user11, user12],
    files: [],
    paging: {
      previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
      next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
    },
  },
};

export const userQueryResponsePage2 = {
  data: {
    users: [user21, user22],
    files: [],
    paging: {
      previous: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
      next: 'eyJiZWZvcmUiOjU1LCJsYXN0IjoxMH0=',
    },
  },
};

export const flaggedUser = {
  ...user11,
  userId: 'to-be-flagged',
  flagCount: 1,
};

export const flaggedUserQueryResponse = {
  data: {
    users: [flaggedUser],
    files: [],
  },
};

export const userUpdateResponse = {
  data: {
    users: [
      {
        isDeleted: false,
        displayName: 'updated-display-name',
        userId: 'test-user',
        metadata: {},
        roles: [],
        permissions: [],
        flagCount: 0,
        hashFlag: null,
        avatarCustomUrl: 'updated-avatarUrl',
        avatarFileId: null,
        isGlobalBanned: false,
      },
    ],
    files: [],
  },
};

export const users = [user11, user12, user13, user14];

// user payload with file
export const userPayload: Amity.UserPayload = {
  users: [user11, user12],
  files: [{ fileId: 'test-file-id' } as Amity.File<'image'>],
};
