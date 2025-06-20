import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';
import { saveCommunityUsers } from '~/communityRepository/utils/saveCommunityUsers';
import { prepareCommunityPayload, prepareCommunityRequest } from '../utils';

/* begin_public_function
  id: community.create
*/
/**
 * ```js
 * import { createCommunity } from '@amityco/ts-sdk'
 * const created = await createCommunity({ communityId: 'foobar', displayName: 'foobar' })
 * ```
 *
 * Creates an {@link Amity.Community}
 *
 * @param bundle The data necessary to create a new {@link Amity.Community}
 * @returns The newly created {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export const createCommunity = async (
  bundle: Pick<
    Amity.Community,
    | 'displayName'
    | 'avatarFileId'
    | 'description'
    | 'isPublic'
    | 'isOfficial'
    | 'postSetting'
    | 'tags'
    | 'metadata'
  > &
    Amity.CommunityStorySettings & {
      userIds?: string[];
      categoryIds?: string[];
      isUniqueDisplayName?: boolean;
    },
): Promise<Amity.Cached<Amity.Community>> => {
  const client = getActiveClient();
  client.log('user/createCommunity', bundle);

  const { data: payload } = await client.http.post<Amity.CommunityPayload>(
    '/api/v3/communities/',
    prepareCommunityRequest(bundle),
  );

  fireEvent('community.created', payload);

  const data = prepareCommunityPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) {
    ingestInCache(data, { cachedAt });
    saveCommunityUsers(data.communities, data.communityUsers);
  }

  const { communities } = data;
  return {
    data: communities[0],
    cachedAt,
  };
};
/* end_public_function */
