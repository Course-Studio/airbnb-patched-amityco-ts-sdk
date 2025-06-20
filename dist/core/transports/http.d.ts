export declare enum RequestCancelation {
    UserDeleted = "User Deleted",
    UserGlobalBanned = "User Global Banned",
    TokenExpired = "Token Expired"
}
/**
 * Creates a pre-configured axios instance
 *
 * @param endpoint The ASC rest api server's URL
 * @returns A pre-configured axios instance
 *
 * @category Transport
 * @hidden
 */
export declare const createHttpTransport: (endpoint: string) => import("axios").AxiosInstance;
