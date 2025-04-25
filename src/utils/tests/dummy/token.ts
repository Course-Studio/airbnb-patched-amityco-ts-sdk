import { user11 } from '.';

export const sessionResponse = {
  data: {
    accessToken: 'test-access-token',
    issuedAt: new Date(),
    expiresAt: new Date(),
    users: [user11],
    files: [],
  },
};
