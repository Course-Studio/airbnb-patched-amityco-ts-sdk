/* eslint-disable no-use-before-define */
import { getActiveClient } from '~/client/api';
import {
  filterByPropIntersection,
  filterBySearchTerm,
  sortByFirstCreated,
  sortByLastCreated,
} from '~/core/query';
import { ENABLE_CACHE_MESSAGE } from '~/utils/constants';
import { dropFromCache } from '~/cache/api';
import { SearchChannelMemberLiveCollectionController } from './SearchChannelMemberLiveCollectionController';

/*
 * Exported for testing
 * @hidden
 */
export const applyFilter = <T extends Amity.Membership<'channel'>>(
  data: T[],
  params: Amity.ChannelMembersLiveCollection,
): T[] => {
  let channelMembers = filterByPropIntersection(data, 'roles', params.roles);

  if (params.memberships) {
    /*
     * even though membership includes muted as a possible value
     * when querying the server.
     * Muted is specified under seperarte property namely isMuted
     * Hence why I've seperately checked for it's equality
     */
    channelMembers = channelMembers.filter(member => {
      // @ts-ignore
      if (params.memberships.includes('muted') && member.isMuted) {
        return true;
      }

      // @ts-ignore
      return params.memberships.includes(member.membership);
    });
  }

  // sort, 'lastCreated' is the default sort order
  const sortBy = params.sortBy ? params.sortBy : 'lastCreated';
  channelMembers = channelMembers.sort(
    sortBy === 'lastCreated' ? sortByLastCreated : sortByFirstCreated,
  );

  return channelMembers;
};

/* begin_public_function
  id: channel.member.query
*/
/**
 * ```js
 * import { searchChannelMembers } from '@amityco/ts-sdk'
 *
 * let channelMembers = []
 * const unsub = searchChannelMembers({
 *   channelId: Amity.Channel['channelId'],
 * }, response => merge(channelMembers, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.ChannelUser}s
 *
 * @param params for querying channel users
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the channel users
 *
 * @category Channel Live Collection
 */
export const searchMembers = (
  params: Amity.SearchChannelMembersLiveCollection,
  callback: Amity.LiveCollectionCallback<Amity.Membership<'channel'>>,
  config?: Amity.LiveCollectionConfig,
) => {
  const { log, cache } = getActiveClient();

  if (!cache) {
    // eslint-disable-next-line no-console
    console.log(ENABLE_CACHE_MESSAGE);
  }

  const timestamp = Date.now();
  log(`searchChannelMembers(tmpid: ${timestamp}) > listen`);

  const searchChannelMemberLiveCollection = new SearchChannelMemberLiveCollectionController(
    params,
    callback,
  );
  const disposers = searchChannelMemberLiveCollection.startSubscription();

  const cacheKey = searchChannelMemberLiveCollection.getCacheKey();

  disposers.push(() => {
    dropFromCache(cacheKey);
  });

  return () => {
    log(`searchChannelMembers(tmpid: ${timestamp}) > dispose`);
    disposers.forEach(fn => fn());
  };
};
/* end_public_function */
