import { getActiveClient } from '~/client/api/activeClient';
import { logout } from './logout';

/* begin_public_function
  id: client.secureLogout
*/
/**
 * ```js
 * import { Client } from '@amityco/ts-sdk'
 * const success = await Client.secureLogout()
 * ```
 *
 * Revoke access token for current user and disconnects an {@link Amity.Client} instance from ASC servers
 *
 * @returns a success boolean if disconnected
 *
 * @category Client API
 * @async
 */
export const secureLogout = async (): Promise<boolean> => {
  const client = getActiveClient();
  const {
    data: { success },
  } = await client.http.delete<{ success: boolean }>('/api/v4/sessions');

  if (!success) {
    throw new Error('Failed to logout');
  }

  const result = await logout();
  return result;
};
/* end_public_function */
