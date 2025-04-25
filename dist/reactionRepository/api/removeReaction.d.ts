/**
 * ```js
 * import { deleteReaction } from '@amityco/ts-sdk'
 * const success = await deleteReaction('post', 'foobar', 'like')
 * ```
 *
 * Removes a {@link Amity.Reaction} from a {@link Amity.Reactable} object
 *
 * @param referenceType The type of thing to add a {@link Amity.Reaction} to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new {@link Amity.Reaction} to.
 * @param reactionName Reaction name, such as a `like` or `love`.
 * @returns The removed result.
 *
 * @category Reaction API
 * @async
 * */
export declare const removeReaction: {
    (referenceType: Amity.Reaction["referenceType"], referenceId: Amity.Reaction["referenceId"], reactionName: Amity.InternalReactor["reactionName"]): Promise<boolean>;
    optimistically(referenceType: Amity.ReactableType, referenceId: Amity.Reaction["referenceId"], reactionName: Amity.InternalReactor["reactionName"]): boolean | undefined;
};
