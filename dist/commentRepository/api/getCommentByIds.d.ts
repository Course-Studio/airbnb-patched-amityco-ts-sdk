/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const comments = await CommentRepository.getCommentByIds(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.Comment} objects
 *
 * @param commentIds the IDs of the {@link Amity.Comment} to fetch
 * @returns the associated collection of {@link Amity.Comment} objects
 *
 * @category Comment API
 * @async
 */
export declare const getCommentByIds: {
    (commentIds: Amity.Comment["commentId"][]): Promise<Amity.Cached<Amity.Comment[]>>;
    locally(commentIds: Amity.Comment["commentId"][]): Amity.Cached<Amity.Comment[]> | undefined;
};
