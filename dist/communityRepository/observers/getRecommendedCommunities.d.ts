/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 *
 * let communities = []
 * const unsub = CommunityRepository.getCommunities({
 *   displayName: Amity.Community['displayName'],
 * }, response => merge(communities, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.Community}s
 *
 * @param params for querying communities
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the communities
 *
 * @category Community Live Collection
 */
export declare const getRecommendedCommunities: (params: Amity.RecommendedCommunityLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Community>, config?: Amity.LiveCollectionConfig) => () => void;
