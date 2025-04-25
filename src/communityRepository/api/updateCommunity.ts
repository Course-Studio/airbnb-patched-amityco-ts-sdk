import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import { fireEvent } from '~/core/events';

import { saveCommunityUsers } from '~/communityRepository/utils/saveCommunityUsers';
import { prepareCommunityPayload, prepareCommunityRequest } from '../utils';

/* begin_public_function
  id: community.update
*/
/**
 * ```js
 * import { updateCommunity } from '@amityco/ts-sdk'
 * const updated = await updateCommunity(communityId, { displayName: 'foobar' })
 * ```
 *
 * Updates an {@link Amity.Community}
 *
 * @param communityId The ID of the {@link Amity.Community} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Community} object
 *
 * @category Community API
 * @async
 */
export const updateCommunity = async (
  communityId: Amity.Community['communityId'],
  patch: Patch<
    Amity.Community,
    'displayName' | 'avatarFileId' | 'description' | 'postSetting' | 'tags' | 'metadata'
  > &
    Amity.CommunityStorySettings,
): Promise<Amity.Cached<Amity.Community>> => {
  const client = getActiveClient();
  client.log('community/updateCommunity', communityId, patch);

  const { data: payload } = await client.http.put<Amity.CommunityPayload>(
    `/api/v3/communities/${communityId}`,
    prepareCommunityRequest(patch),
  );

  fireEvent('community.updated', payload);

  const data = prepareCommunityPayload(payload);

  const cachedAt = client.cache && Date.now();
  if (client.cache) {
    ingestInCache(data, { cachedAt });
    saveCommunityUsers(data.communities, data.communityUsers);
  }

  const { communities } = data;

  return {
    data: communities.find(community => community.communityId === communityId)!,
    cachedAt,
  };
};
/* end_public_function */
