export declare const applyFilter: <T extends Amity.Membership<"community">>(data: T[], params: Amity.CommunityMemberLiveCollection) => T[];
/**
 * ```js
 * import { getMembers } from '@amityco/ts-sdk'
 *
 * let communityMembers = []
 * const unsub = getMembers({
 *   communityId: Amity.Community['communityId'],
 * }, response => merge(communityMembers, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.CommunityUser}s
 *
 * @param params for querying community users
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the community users
 *
 * @category Community Live Collection
 */
export declare const getMembers: (params: Amity.CommunityMemberLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Membership<"community">>, config?: Amity.LiveCollectionConfig) => () => void;
