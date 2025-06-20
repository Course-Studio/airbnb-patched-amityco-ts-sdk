import { API_REGIONS } from '~/client/utils/endpoints';
/**
 * ```js
 * import { createClient } from '@amityco/ts-sdk'
 * const client = createClient(apiKey, 'https://asc.server/', 'myClient')
 * ```
 *
 * Creates a new {@link Amity.Client} instance
 *
 * @param apiKey for the {@link Amity.Client} instance
 * @param apiRegion endpoint to connect to
 * @param apiEndpoint custom endpoint in case you don't want to use a preset endpoint
 * @param param.debugSession session's identifier for the client's logger instance
 * @returns A {@link Amity.Client} instance
 *
 * @category Client API
 * */
export declare const createClient: (apiKey: string, apiRegion?: (typeof API_REGIONS)[keyof typeof API_REGIONS], { debugSession, apiEndpoint, prefixDeviceIdKey, rteEnabled, }?: {
    debugSession?: string;
    apiEndpoint?: {
        http?: string;
        mqtt?: string;
        upload?: string;
    };
    prefixDeviceIdKey?: string;
    rteEnabled?: boolean;
}) => Amity.Client;
