/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk';
 *
 * let community;
 *
 * const unsub = CommunityRepository.getCommunity(communityId, response => {
 *   community = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Community}
 *
 * @param communityId the ID of the message to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the community
 *
 * @category Community Live Object
 */
export declare const getCommunity: (communityId: Amity.Community["communityId"], callback: Amity.LiveObjectCallback<Amity.Community>) => Amity.Unsubscriber;
