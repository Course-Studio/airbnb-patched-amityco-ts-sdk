import { getToken } from '../api/getToken';
/**
 * A util to set or refresh client token
 *
 * @param params.userId the user ID for the current session
 * @param params.displayName the user's displayName for the current session
 * @param params.deviceId Manual override of the user's device id (for device management)
 * @param params.authToken The authentication token - necessary when network option is set to secure
 * @returns token & user info
 *
 * @category private
 * @async
 */
export declare const setClientToken: (params: Parameters<typeof getToken>[0]) => Promise<{
    accessToken: string;
    users: Amity.InternalUser[];
}>;
