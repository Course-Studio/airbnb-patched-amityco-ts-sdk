/**
 * ```js
 * import { getReactions } from '@amityco/ts-sdk'
 *
 * let reactions = []
 * const unsub = liveReactions({
 *   referenceId: Amity.Reaction['referenceId'],
 *   referenceType: Amity.Reaction['referenceType'],
 * }, response => merge(reactions, response.data))
 * ```
 *
 * Observe all mutations on a list of {@link Amity.InternalReactor} for a given target object
 *
 * @param params for querying reactions
 * @param callback the function to call when new data are available
 * @param config the live collection configuration
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the messages
 *
 * @category Reactions Live Collection
 */
export declare const getReactions: (params: Amity.ReactionLiveCollection, callback: Amity.LiveCollectionCallback<Amity.Reactor>, config?: Amity.LiveCollectionConfig) => Amity.Unsubscriber;
