import { createHttpTransport } from '~/core/transports';
import { getDeviceId, getDeviceInfo } from '~/core/device';
import { API_REGIONS, computeUrl } from '~/client/utils/endpoints';

/**
 * Retrieves accessToken info to use in Beta services
 *
 * @param apiKey for the Http Client instance
 * @param apiRegion endpoint to connect to
 * @param params The token parameters
 * @param params.userId The userId to use to issue a token
 * @param params.displayName The user's displayName
 * @param params.authToken The authentication token - necessary when network option is set to secure
 * @return An accessToken info object for the given userId
 *
 * @category External API
 * @hidden
 */
export const createUserToken = async (
  apiKey: string,
  apiRegion: typeof API_REGIONS[keyof typeof API_REGIONS],
  params: {
    userId: Amity.InternalUser['userId'];
    displayName?: Amity.InternalUser['displayName'];
    authToken?: string;
  },
) => {
  const deviceId = await getDeviceId();
  const deviceInfo = getDeviceInfo();
  const http = createHttpTransport(computeUrl('http', apiRegion));

  const { data } = await http.post<Amity.Tokens>(
    '/api/v5/sessions',
    {
      ...params,
      deviceId,
      deviceInfo: { ...deviceInfo, model: 'token management API on TS-SDK' },
    },
    { headers: { 'X-API-Key': apiKey } },
  );

  return { accessToken: data.accessToken };
};
