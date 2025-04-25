import { convertRawUserToInternalUser } from '~/userRepository/utils/convertRawUserToInternalUser';

export function prepareFollowersPayload(
  response: Amity.FollowersPayload,
): Amity.ProcessedFollowersPayload {
  const { users, follows, ...rest } = response;

  return {
    ...rest,
    follows,
    users: users.map(convertRawUserToInternalUser),
  };
}

export function prepareFollowingsPayload(
  response: Amity.FollowersPayload,
): Amity.ProcessedFollowersPayload {
  const { users, follows, ...rest } = response;

  return {
    ...rest,
    follows,
    users: users.map(convertRawUserToInternalUser),
  };
}

export function prepareFollowStatusPayload(
  response: Amity.FollowStatusPayload,
): Amity.ProcessedFollowStatusPayload {
  const { follows, ...rest } = response;

  return {
    ...rest,
    follows,
  };
}
