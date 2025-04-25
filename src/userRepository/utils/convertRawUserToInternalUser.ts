export function convertRawUserToInternalUser(rawUser: Amity.RawUser): Amity.InternalUser {
  return {
    ...rawUser,
    isGlobalBanned: rawUser?.isGlobalBan || false,
  };
}
