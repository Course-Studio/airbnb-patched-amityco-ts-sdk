import { getResolver } from '~/core/model';
import { pullFromCache } from '~/cache/api';
// Note:
// this file should contain a suite of filtering utilities to help the
// local version of the query functions.

/**
 * Filter a given collection with strict equality against a param
 *
 * @param collection the collection to filter
 * @param key the key of the collection's items to challenge
 * @param value the expected value
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export const filterByPropEquality = <T = Record<string, unknown>>(
  collection: T[],
  key: keyof T,
  value: any,
) =>
  value !== undefined
    ? collection.filter(item => JSON.stringify(item[key]) === JSON.stringify(value))
    : collection;

export const filterByStringComparePartially = <T = Record<string, unknown>>(
  collection: T[],
  key: keyof T,
  value: any,
) =>
  value !== undefined
    ? collection.filter(item => {
        if (typeof item[key] === 'string' && typeof value === 'string') {
          return String(item[key]).toLowerCase().match(value.toLowerCase());
        }
        return false;
      })
    : collection;

export const filterByPropInclusion = <T = Record<string, unknown>>(
  collection: T[],
  key: keyof T,
  value: any[] | undefined,
) => (value !== undefined ? collection.filter(item => value.includes(item[key])) : collection);

export const filterByPropIntersection = <T extends Record<string, unknown>>(
  collection: T[],
  key: keyof T,
  values: any[] | undefined,
) => {
  if (!values?.length) return collection;

  return collection.filter(
    item =>
      Array.isArray(item[key]) && values.some(value => (item[key] as unknown[]).includes(value)),
  );
};

/**
 * Filter a channel collection by membership of the userId
 *
 * @param collection the channel collection to filter
 * @param membership the membership to be filtered by
 * @param userId user id to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export const filterByChannelMembership = (
  collection: Amity.Channel[],
  membership: Amity.ChannelLiveCollection['membership'],
  userId: Amity.Membership<'channel'>['userId'],
): Amity.Channel[] => {
  if (membership === 'all') {
    return collection;
  }

  return collection.filter(c => {
    // if channel is a community, only member user must receive realtime event
    if (c.type === 'community') return true;

    // get resolver for the channel by user
    const channelUserCacheKey = getResolver('channelUsers')({
      channelId: c.channelPublicId,
      userId,
    });

    const channelUser = pullFromCache<Amity.Membership<'channel'>>([
      'channelUsers',
      'get',
      channelUserCacheKey,
    ])?.data;

    if (membership === 'member') {
      return channelUser && channelUser.membership !== 'none';
    }

    // only membership value remainging is 'notMember'
    return !channelUser || channelUser.membership === 'none';
  });
};

/**
 * Filter a channel collection by membership of the userId
 *
 * @param collection the channel collection to filter
 * @param feedType to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export const filterByFeedType = <T extends Amity.InternalPost>(
  collection: T[],
  feedType: Amity.Feed['feedType'],
): T[] => {
  /*
   * It is possible that the targetId & feedId are the same for most of the posts
   * But since cache is in-memory, i've avoided memoizing, to avoid premature
   * optimization. Can be revisited if performance issues arise
   */
  return collection.filter(({ targetId, feedId }) => {
    const feed = pullFromCache<Amity.Feed>([
      'feed',
      'get',
      getResolver('feed')({ targetId, feedId }),
    ])?.data!;

    return feed && feed.feedType === feedType;
  });
};

/**
 * Filter a community collection by membership of the userId
 *
 * @param collection the community to filter
 * @param membership the membership to be filtered by
 * @param userId user id to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export const filterByCommunityMembership = <T extends Amity.Community>(
  collection: T[],
  membership: Amity.CommunityLiveCollection['membership'],
  userId: Amity.Membership<'community'>['userId'],
): T[] => {
  if (membership === 'all') {
    return collection;
  }

  return collection.filter(c => {
    // get resolver for the community by user
    const communityUserCacheKey = getResolver('communityUsers')({
      communityId: c.communityId,
      userId,
    });

    const communityUser = pullFromCache<Amity.Membership<'community'>>([
      'communityUsers',
      'get',
      communityUserCacheKey,
    ])?.data;

    if (membership === 'member') {
      return communityUser && communityUser.communityMembership === 'member';
    }

    // only membership value remainging is 'notMember'
    return !communityUser || communityUser.communityMembership !== 'none';
  });
};

/**
 * Filter a post collection by dataType
 *
 * @param collection the post to filter
 * @param dataTypes of the post to be filtered by
 * @returns a filtered collection with items only matching the criteria
 *
 * @hidden
 */
export const filterByPostDataTypes = <T extends Amity.InternalPost>(
  collection: T[],
  dataTypes: Amity.PostLiveCollection['dataTypes'],
): T[] => {
  return collection.reduce((acc: T[], post: T) => {
    // Check dataType for current post
    if (dataTypes?.includes(post.dataType)) {
      return [...acc, post];
    }

    if ((post?.children || []).length > 0) {
      const childPost = pullFromCache<Amity.InternalPost>(['post', 'get', post.children[0]])?.data;
      if (!dataTypes?.includes(childPost?.dataType)) return [...acc, post];
      return acc;
    }

    return acc;
  }, []);
};

/**
 * Filter a collection by search term
 * Check if userId matches first if not filter by displayName
 *
 * @param collection to be filtered
 * @param searchTerm to filter collection by
 * @returns a filtered collection with items only matching the search term
 *
 * @hidden
 */
export const filterBySearchTerm = <
  T extends { userId: Amity.InternalUser['userId']; user?: Amity.InternalUser },
>(
  collection: T[],
  searchTerm: string,
): T[] => {
  /*
   * Search term should match regardless of the case.
   * Hence, the flag "i", is passed to the created regex
   */
  const containsMatcher = new RegExp(searchTerm, 'i');

  return collection.filter(m => {
    if (m.userId.match(containsMatcher)) return true;

    return m.user && m.user.displayName?.match(containsMatcher);
  });
};
