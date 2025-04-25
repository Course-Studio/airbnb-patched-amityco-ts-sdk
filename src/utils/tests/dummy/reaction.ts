import { post11, user11 } from '.';

export const reactor11: Amity.InternalReactor = {
  reactionName: 'reaction11',
  reactionId: 'reaction11',
  userId: user11.userId,
  createdAt: '',
};
export const reaction11: Amity.Reaction = {
  referenceId: post11.postId,
  referenceType: 'post',
  reactors: [reactor11],
};

export const reactionPayload: Amity.ReactionPayload = {
  reactions: [reaction11],
  users: [user11],
};
