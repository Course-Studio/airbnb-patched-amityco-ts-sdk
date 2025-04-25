import { liveObject } from '~/utils/liveObject';
import { pullFromCache } from '~/cache/api';
import { getComment as _getComment } from '../internalApi/getComment';
import {
  onCommentCreated,
  onCommentDeleted,
  onCommentFlagged,
  onCommentReactionAdded,
  onCommentReactionRemoved,
  onCommentUnflagged,
  onCommentUpdated,
} from '../events';
import { onCommentDeleteLocal } from '../events/onCommentDeletedLocal';
import { onLocalCommentReactionAdded } from '../events/onLocalCommentReactionAdded';
import { onLocalCommentReactionRemoved } from '../events/onLocalCommentReactionRemoved';

/* begin_public_function
  id: comment.get
*/
/**
 * ```js
 * import { CommentRepository } from '@amityco/ts-sdk';
 *
 * let comment;
 *
 * const unsub = CommentRepository.getComment(commentId, response => {
 *   comment = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Comment}
 *
 * @param commentId the ID of the comment to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the comment
 *
 * @category Comment Live Object
 */
export const getComment = (
  commentId: Amity.Comment['commentId'],
  callback: Amity.LiveObjectCallback<Amity.Comment>,
): Amity.Unsubscriber => {
  return liveObject(commentId, callback, 'commentId', _getComment, [
    onCommentDeleteLocal,
    onCommentDeleted,
    onCommentFlagged,
    onCommentReactionAdded,
    onCommentReactionRemoved,
    onCommentUnflagged,
    onCommentUpdated,
    onLocalCommentReactionAdded,
    onLocalCommentReactionRemoved,
  ]);
};
/* end_public_function */
