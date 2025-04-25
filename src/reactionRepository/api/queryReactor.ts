import { getActiveClient } from '~/client/api/activeClient';

import { queryReactions } from './queryReactions';

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
export const queryReactor = async (
  query: Amity.QueryReactions,
): Promise<Amity.Paged<Amity.InternalReactor, Amity.Page<string>>> => {
  const client = getActiveClient();
  client.log('reaction/queryReactor', query);

  const { data, ...response } = await queryReactions(query);

  return { ...response, data: data[0].reactors };
};
