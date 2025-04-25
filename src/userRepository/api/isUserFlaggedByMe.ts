import { getActiveClient } from '~/client/api/activeClient';
import { synchronousWSCall } from '~/core/transports';

/* begin_public_function
  id: user.check_flag_by_me
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const isFlagged = await UserRepository.isUserFlaggedByMe(postId)
 * ```
 *
 * @param userId The ID of the thing to check a report to.
 * @returns `true` if the report is created by me, `false` if doesn't.
 *
 * @category Report API
 * @async
 * */
export const isUserFlaggedByMe = async (userId: Amity.User['userId']): Promise<boolean> => {
  const client = getActiveClient();
  client.log('user/isUserFlaggedByMe', userId);

  const {
    data: { isFlagByMe },
  } = await client.http.get(`/api/v3/users/${userId}/isFlagByMe`);

  return isFlagByMe;
};
/* end_public_function */
