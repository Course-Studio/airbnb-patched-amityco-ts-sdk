import { getActiveClient } from '~/client';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache } from '~/cache/api';
import { BlockedUserLiveCollectionController } from './getBlockedUsers/BlockedUserLiveCollectionController';

/* begin_public_function
  id: user.get_blocked_users
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const unblockedUser = await UserRepository.blockUser('userId')
 * ```
 *
 * Blocks a {@link Amity.InternalUser}
 *
 * @param params The params to get blocked {@link Amity.InternalUser}s
 * @param callback to recieve updates on unblocked {@link Amity.InternalUser}s
 * @returns {@link Amity.Unsubscriber} to unsubscribe from collection
 *
 * @category Post API
 * @async
 */
export const getBlockedUsers = (
  params: Amity.BlockedUsersLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.InternalUser>,
  config?: Amity.LiveCollectionConfig,
): Amity.Unsubscriber => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`getBlockedUsers(tmpid: ${timestamp}) > listen`);

  const blockedUserLiveCollection = new BlockedUserLiveCollectionController(params, callback);
  const disposers = blockedUserLiveCollection.startSubscription();

  const cacheKey = blockedUserLiveCollection.getCacheKey();

  disposers.push(() => dropFromCache(cacheKey));

  return () => {
    log(`getBlockedUsers(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
    dropFromCache(cacheKey);
  };
};
/* end_public_function */
