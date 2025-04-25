import { convertRawUserToInternalUser } from './convertRawUserToInternalUser';

export function prepareUserPayload(response: Amity.UserPayload): Amity.ProcessedUserPayload {
  return {
    users: response.users.map(convertRawUserToInternalUser),
    files: response.files,
  };
}
