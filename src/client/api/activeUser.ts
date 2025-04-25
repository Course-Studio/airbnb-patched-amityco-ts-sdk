import { ASCError } from '~/core/errors';

let activeUser: Amity.ActiveUser | null = null;

/* begin_public_function
  id: client.get_current_user
*/
/**
 * for internal use
 */
export const getActiveUser = () => {
  if (!activeUser) {
    throw new ASCError(
      'Connect client first',
      Amity.ClientError.UNKNOWN_ERROR,
      Amity.ErrorLevel.FATAL,
    );
  }

  return activeUser!;
};
/* end_public_function */

export const setActiveUser = (user: Amity.ActiveUser) => {
  activeUser = {
    _id: user._id,
    userId: user.userId,
    path: user.path,
  };
};
