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
export declare const secureLogout: () => Promise<boolean>;
//# sourceMappingURL=secureLogout.d.ts.map