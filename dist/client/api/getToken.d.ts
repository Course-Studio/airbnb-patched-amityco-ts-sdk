/**
 * Retrieves a pair of {@link Amity.Tokens} necessary for connection
 *
 * @param params.userId The userId to use to issue a token
 * @param params.displayName The user's displayName
 * @param params.deviceId The user's device Id (can be manually set for native users)
 * @param params.authToken The authentication token - necessary when network option is set to secure
 * @return The accessToken for the given userId
 *
 * @category Client API
 * @hidden
 */
export declare const getToken: ({ params, options, }: {
    params: {
        userId: Amity.InternalUser["userId"];
        displayName?: Amity.InternalUser["displayName"];
        authToken?: string;
        deviceId: Amity.Device["deviceId"];
    };
    options?: {
        setAccessTokenCookie?: boolean;
    };
}) => Promise<Amity.Tokens & {
    users: Amity.InternalUser[];
}>;
