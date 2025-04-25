/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk'
 * const comments = await CommentRepository.queryComments({ referenceType: 'post', referenceId: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalComment} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalComment} objects
 *
 * @category Comment API
 * @async
 */
export declare const queryComments: (query: Amity.QueryComments) => Promise<Amity.Cached<Amity.PageToken<Amity.InternalComment>>>;
//# sourceMappingURL=queryComments.d.ts.map