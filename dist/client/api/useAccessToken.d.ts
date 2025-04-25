interface Params {
    userId: string;
    token: {
        issuedAt: string;
        expiresAt: string;
        accessToken: string;
    };
}
/**
 * ```js
 * import { login } from '@amityco/ts-sdk/client/api'
 * const success = await login({
 *   userId: 'XYZ123456789',
 * })
 * ```
 *
 * Connects an {@link Amity.Client} instance to ASC servers
 *
 * @param params the connect parameters
 * @param params.userId the user ID for the current session
 * @param params.displayName the user's displayName for the current session
 * @param params.deviceId Manual override of the user's device id (for device management)
 * @param params.authToken The authentication token - necessary when network option is set to secure
 * @returns a success boolean if connected
 *
 * @category Client API
 * @async
 */
export declare const useAccessToken: (params: Params, sessionHandler: Amity.SessionHandler, config?: Amity.ConnectClientConfig) => Promise<boolean>;
/**
 * A util to validate client token and get current user data
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
export declare const validateAccessToken: ({ token, userId }: Params) => Promise<Amity.InternalUser>;
export {};
