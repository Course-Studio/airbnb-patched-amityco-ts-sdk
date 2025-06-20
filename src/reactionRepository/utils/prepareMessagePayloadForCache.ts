import { pullFromCache } from '~/cache/api';
import { getActiveClient } from '~/client/api/activeClient';

/** @hidden */
/*
 * @param message payload from http request without myReactions
 * add myReactions to http response if the event was a reaction event
 */
export const prepareMessagePayloadForCache = (
  payload: Amity.InternalMessage,
  reactors: Amity.InternalReactor[],
  event: Pick<Amity.Events, 'message.reactionAdded' | 'message.reactionRemoved'> | string,
) => {
  const client = getActiveClient();

  const cached = pullFromCache<Amity.Message>(['message', 'get', payload.messageId]);
  // '[]' in cases where the new reaction is the first one
  const myReactions = cached?.data.myReactions || [];

  // add myReactions to the payload
  Object.assign(payload, { myReactions });

  // check if there are any updates to the reactions
  const latestReaction = reactors[0];
  const isLatestReactionMine = latestReaction && latestReaction.userId === client.userId;

  if (!isLatestReactionMine) {
    return;
  }

  // new reaction added
  if (event === 'message.reactionAdded' && !myReactions.includes(latestReaction.reactionName)) {
    Object.assign(payload, {
      myReactions: [...myReactions, latestReaction.reactionName],
    });
  }

  // existing reaction removed
  if (event === 'message.reactionRemoved' && myReactions.includes(latestReaction.reactionName)) {
    Object.assign(payload, {
      myReactions: myReactions.filter(x => x !== latestReaction.reactionName),
    });
  }
};
