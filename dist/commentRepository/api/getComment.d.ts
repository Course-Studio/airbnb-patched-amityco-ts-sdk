/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const comment = await CommentRepository.getComment('foobar')
 * ```
 *
 * Fetches a {@link Amity.Comment} object
 *
 * @param commentId the ID of the {@link Amity.Comment} to fetch
 * @returns the associated {@link Amity.Comment} object
 *
 * @category Comment API
 * @async
 */
export declare const getComment: {
    (commentId: Amity.Comment["commentId"]): Promise<Amity.Cached<Amity.Comment>>;
    locally(commentId: Amity.Comment["commentId"]): Amity.Cached<Amity.Comment> | undefined;
};
