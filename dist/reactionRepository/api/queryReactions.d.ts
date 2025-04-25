/**
 * ```js
 * import { queryReactions } from '@amityco/ts-sdk'
 * const { data: reactions, prevPage, nextPage } = await queryReactions({
 *   referenceId: 'postId',
 *   referenceType: 'post',
 * })
 * ```
 *
 * Queries a paginable list of {@link Amity.Reaction} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Reaction} objects
 *
 * @reaction Reaction API
 * @async
 * */
export declare const queryReactions: (query: Amity.QueryReactions) => Promise<Amity.Paged<Amity.Reaction, Amity.Page<string>>>;
