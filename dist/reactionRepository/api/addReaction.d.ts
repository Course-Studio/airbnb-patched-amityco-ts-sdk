/**
 * ```js
 * import { addReaction } from '@amityco/ts-sdk'
 * const success = await addReaction('post', postId, 'like')
 * ```
 *
 * Creates an {@link Amity.Reaction}
 *
 * @param referenceType The type of thing to add a {@link Amity.Reaction} to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new {@link Amity.Reaction} to.
 * @param reactionName Reaction name, such as a `like` or `love`.
 * @returns The added result.
 *
 * @category Reaction API
 * @async
 * */
export declare const addReaction: {
    (referenceType: Amity.Reaction["referenceType"], referenceId: Amity.Reaction["referenceId"], reactionName: Amity.InternalReactor["reactionName"]): Promise<boolean>;
    optimistically(referenceType: Amity.ReactableType, referenceId: Amity.Reaction["referenceId"], reactionName: Amity.InternalReactor["reactionName"]): boolean | undefined;
};
