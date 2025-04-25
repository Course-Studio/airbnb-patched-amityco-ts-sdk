import { getActiveClient } from '~/client/api/activeClient';

import { toToken, toPageRaw } from '~/core/query';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { REFERENCE_API_V5 } from '~/reactionRepository/api/constants';

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
export const queryReactions = async (
  query: Amity.QueryReactions,
): Promise<Amity.Paged<Amity.Reaction, Amity.Page<string>>> => {
  const client = getActiveClient();
  client.log('reaction/queryReactions', query);

  const { page = { limit: 10 }, ...params } = query ?? {};

  const { data } = await client.http.get<Amity.ReactionPayload & Amity.Pagination>(
    `/api/v3/reactions`,
    {
      params: {
        ...params,
        referenceVersion: REFERENCE_API_V5, // Need to put this param to make it can query reaction for message in sub-channel
        options: {
          token: toToken(page, 'afterbeforeraw'),
        },
      },
    },
  );

  const { paging, ...payload } = data;
  const { reactions } = payload;

  // FIXME: correct reactions type in model
  // @ts-ignore
  ingestInCache({ ...payload, reactions }); // Save reaction response into cache
  ingestInCache({ ...payload, reactors: reactions[0].reactors }); // Save reactors data into cache for support reaction query

  const nextPage = toPageRaw(paging.next);
  const prevPage = toPageRaw(paging.previous);

  return { data: reactions, prevPage, nextPage };
};
