import { pullFromCache } from '~/cache/api';
import { getActiveClient } from '~/client/api';
import { updateMembershipStatus } from '~/communityRepository/utils/communityWithMembership';

const getMyReactionsInCache = <
  T extends Amity.PostPayload | Amity.CommentPayload | Amity.StoryPayload,
>(
  payload: T,
  eventPrefix: string,
) => {
  let id: string;
  let domain: string;

  if (eventPrefix === 'post') {
    domain = 'post';
    id = (<Amity.PostPayload>payload).posts[0].postId;
  } else if (eventPrefix === 'comment') {
    domain = 'comment';
    id = (<Amity.PostPayload>payload).comments[0].commentId;
  } else if (eventPrefix === 'story') {
    domain = 'story';
    id = (<Amity.StoryPayload>payload).stories[0].referenceId!;
  } else {
    throw new Error(`Unknown event type`);
  }

  const cached = pullFromCache<Amity.InternalComment | Amity.InternalStory>([domain, 'get', id])
    ?.data?.myReactions;

  return cached || [];
};

const rebuildPayload = <
  T extends Amity.PostPayload | Amity.CommentPayload | Amity.StoryPayload,
  K extends keyof T,
>(
  payload: T,
  payloadKey: K,
  myReactions: Amity.Reactable['myReactions'],
) => {
  const [model]: any = payload[payloadKey];

  return { ...payload, [payloadKey]: [{ ...model, myReactions }] };
};

const remappingMyReaction = (
  event: string,
  userId: string,
  reactionName: string,
  myReactions: Amity.Reactable['myReactions'] = [],
) => {
  const eventSuffix = event.split('.')[1]; // 'addReaction' | 'removeReaction' | 'reactionAdded' | 'reactionRemoved'

  let newMyReactions = myReactions;

  if (getActiveClient().userId === userId) {
    if (['addReaction', 'reactionAdded'].includes(eventSuffix)) {
      if (!newMyReactions.includes(reactionName)) {
        newMyReactions.push(reactionName);
      }
    } else if (['removeReaction', 'reactionRemoved'].includes(eventSuffix)) {
      newMyReactions = newMyReactions.filter(reaction => reaction !== reactionName);
    } else {
      throw new Error(`Unknown event type: ${eventSuffix}`);
    }
  }

  return newMyReactions;
};

/** @hidden */
export const prepareReactionPayloadFromEvent = <
  T extends
    | 'post.addReaction'
    | 'post.removeReaction'
    | 'comment.addReaction'
    | 'comment.removeReaction',
  P extends Amity.Events[T],
>(
  event: T,
  payload: P,
): P => {
  const eventPrefix = event.split('.')[0]; // 'post' | 'comment'

  const myReactions: Amity.Reactable['myReactions'] = getMyReactionsInCache(payload, eventPrefix);

  const newMyReaction = remappingMyReaction(
    event,
    payload.reactor.userId,
    payload.reactor.reactionName,
    myReactions,
  );

  return rebuildPayload(payload, <keyof P>`${eventPrefix}s`, newMyReaction);
};

export const prepareStoryReactionPayloadFormEvent = <
  T extends 'story.reactionAdded' | 'story.reactionRemoved',
  P extends Amity.Events[T],
>(
  event: T,
  payload: P,
): P => {
  const eventPrefix = event.split('.')[0]; // 'post' | 'comment' | 'story'

  let myReactions: Amity.Reactable['myReactions'] = getMyReactionsInCache(payload, eventPrefix);

  if (payload?.reactions && payload.reactions.length > 0) {
    myReactions = remappingMyReaction(
      event,
      payload.reactions[0]?.userId,
      payload.reactions[0]?.reactionName,
      myReactions,
    );
  }

  // Rebuild the payload with the new myReactions
  const newPayload = rebuildPayload(payload, 'stories', myReactions);

  if (!payload?.communities || !payload?.communityUsers) return newPayload;

  const communities = updateMembershipStatus(payload.communities, payload.communityUsers);
  return { ...newPayload, communities };
};

export const prepareCommentFromFlaggedEvent = (payload: Amity.CommentPayload) => {
  const myReactions: Amity.Reactable['myReactions'] = getMyReactionsInCache(payload, 'comment');
  return rebuildPayload(payload, 'comments', myReactions);
};
