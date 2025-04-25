import axios, { AxiosResponse } from 'axios';
import HttpAgent, { HttpsAgent } from 'agentkeepalive';

import { ASCError } from '~/core/errors';

import { fireEvent } from '../events';
import { unwrapPayload } from './utils';
import NetworkActivitiesWatcher from '~/client/utils/NetworkActivitiesWatcher';

/*
 * Defined here as transport is a private module. Also, outside of this module
 * this enum holds no meaning.
 *
 * @private (exported for testing)
 */
export enum RequestCancelation {
  UserDeleted = 'User Deleted',
  UserGlobalBanned = 'User Global Banned',
  TokenExpired = 'Token Expired',
}
/*
 * Axios no longer supports `cancelToken`, since v0.22.0, and is marked as
 * deprecated. The doc asks to use the abort controller that fetch uses instead
 *
 * More Info:
 * https://axios-http.com/docs/cancellation
 */
const controller = new AbortController();

/**
 * Handle Request Cancellation
 *
 * @param cancel Reason for cancelation
 *
 * @category Transport Util
 * @hidden
 */
const handleRequestCancelation = (cancel: RequestCancelation) => {
  switch (cancel) {
    case RequestCancelation.UserGlobalBanned:
      /*
       * Note:
       * Firing a virtual event (fireEvent) is not required as the metadata in
       * the request (isGlobalBanned) is only true once the user has been banned
       * and the SDK has recieved a global ban event
       */
      throw new ASCError(cancel, Amity.ServerError.GLOBAL_BAN, Amity.ErrorLevel.FATAL);

    case RequestCancelation.UserDeleted:
      /*
       * Note:
       * Firing a virtual event (fireEvent) is not required. For same reason as
       * above. Only difference is that the event recieved is user deleted
       */
      throw new ASCError(cancel, Amity.ServerError.UNAUTHORIZED, Amity.ErrorLevel.FATAL);

    case RequestCancelation.TokenExpired:
      fireEvent('tokenExpired', Amity.SessionStates.TOKEN_EXPIRED);

      throw new ASCError(cancel, Amity.ClientError.TOKEN_EXPIRED, Amity.ErrorLevel.FATAL);

    default:
      throw new ASCError(
        'Request Aborted',
        Amity.ClientError.UNKNOWN_ERROR,
        Amity.ErrorLevel.ERROR,
      );
  }
};

/**
 * Creates a pre-configured axios instance
 *
 * @param endpoint The ASC rest api server's URL
 * @returns A pre-configured axios instance
 *
 * @category Transport
 * @hidden
 */
export const createHttpTransport = (endpoint: string) => {
  const options = {
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000,
    freeSocketTimeout: 30000,
  };

  const instance = axios.create({
    baseURL: endpoint,
    httpAgent: new HttpAgent(options),
    httpsAgent: new HttpsAgent(options),
    signal: controller.signal,
    /*
     * If paramSerializer is required, use the serialize option to stringify
     * params. The encode option will pass complex params as string only whereas
     * the serialize option will pass params in the format Record<string, any>
     *
     * For more details:
     * https://github.com/axios/axios#request-config
     */
  });

  instance.defaults.withCredentials = false;

  instance.interceptors.request.use(config => {
    // do not check expiration for token creation url
    if (config.url === '/api/v5/sessions') {
      return config;
    }

    // check global.ts for the extension of AxiosRequestConfig
    if (config.metadata) {
      const { tokenExpiry, isGlobalBanned, isUserDeleted } = config.metadata;

      if (isGlobalBanned) {
        controller.abort();
        handleRequestCancelation(RequestCancelation.UserGlobalBanned);
      }

      if (isUserDeleted) {
        controller.abort();
        handleRequestCancelation(RequestCancelation.UserDeleted);
      }

      if (tokenExpiry) {
        if (Date.now() >= Date.parse(tokenExpiry)) {
          controller.abort(RequestCancelation.UserDeleted);
          handleRequestCancelation(RequestCancelation.TokenExpired);
        }
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    response => {
      const responseHeaders = new Headers();

      Object.entries(response.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          responseHeaders.append(key, value);
        }
      });

      NetworkActivitiesWatcher.getInstance().setNetworkActivities(
        new Request(response.request.url, {
          method: response.request.method,
          headers: response.request.headers,
          body: response.request.data,
        }),
        {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        },
      );

      return response;
    },
    error => {
      const { response } = error;

      // handle unauthorized request
      if (response?.data.code === Amity.ServerError.UNAUTHORIZED) {
        fireEvent('tokenTerminated', Amity.SessionStates.TERMINATED);
      }

      // if it's an error with status in the response payload,
      // then it's an expected error.
      if (response?.data?.status) {
        unwrapPayload(response?.data);
      }

      // as on request cancellation error is returned
      if (controller.signal.aborted) {
        throw error;
      }
      // unexpected error.

      throw new Error(response?.data ?? error);
    },
  );

  instance.defaults.paramsSerializer = {
    encode: params => encodeURIComponent(params),
  };

  return instance;
};
