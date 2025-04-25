import { convertRawUserToInternalUser } from './convertRawUserToInternalUser';

export function prepareBlockedUserPayload(
  response: Amity.BlockedUserPayload,
): Amity.ProcessedBlockedUserPayload {
  const { users, follows, ...rest } = response;

  return {
    ...rest,
    follows: follows.map(follow => {
      const followUser = users.find(user => user.userId === follow.from)!;
      return {
        ...follow,
        user: convertRawUserToInternalUser(followUser),
      };
    }),
    users: users.map(convertRawUserToInternalUser),
  };
}
