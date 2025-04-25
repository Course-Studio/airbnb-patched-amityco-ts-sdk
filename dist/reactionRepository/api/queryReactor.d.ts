/**
 * ```js
 * import { queryReactor } from '@amityco/ts-sdk'
 * const { data: reactions, prevPage, nextPage } = await queryReactor({
 *   referenceId: 'postId',
 *   referenceType: 'post',
 * })
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalReactor} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalReactor} objects
 *
 * @reaction Reaction API
 * @async
 * */
export declare const queryReactor: (query: Amity.QueryReactions) => Promise<Amity.Paged<Amity.InternalReactor, Amity.Page<string>>>;
//# sourceMappingURL=queryReactor.d.ts.map