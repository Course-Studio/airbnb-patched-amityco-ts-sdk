import { on } from 'events';
import { liveObject } from '~/utils/liveObject';
import { getPost as _getPost } from '../api/getPost';
import {
  onPostApproved,
  onPostDeclined,
  onPostDeleted,
  onPostFlagged,
  onPostReactionAdded,
  onPostReactionRemoved,
  onPostUnflagged,
  onPostUpdated,
} from '../events';
import { pullFromCache, pushToCache } from '~/cache/api';
import { LinkedObject } from '~/utils/linkedObject';
import { onCommentCreated, onCommentDeleted } from '~/commentRepository';
import { convertEventPayload } from '~/utils/event';
import { onPostUpdatedLocal } from '~/postRepository/events/onPostUpdatedLocal';
import { onLocalPostReactionAdded } from '~/postRepository/events/onLocalPostReactionAdded';
import { onLocalPostReactionRemoved } from '~/postRepository/events/onLocalPostReactionRemoved';
import { onLocalPostDeleted } from '~/postRepository/events/onLocalPostDeleted';

/* begin_public_function
  id: post.get
*/
/**
 * ```js
 * import { PostRepository } from '@amityco/ts-sdk';
 *
 * let post;
 *
 * const unsub = PostRepository.getPost(postId, response => {
 *   post = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Post}
 *
 * @param postId the ID of the message to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the sub channel
 *
 * @category Post Live Object
 */
export const getPost = (
  postId: Amity.Post['postId'],
  callback: Amity.LiveObjectCallback<Amity.Post>,
): Amity.Unsubscriber => {
  const responder: Amity.LiveObjectCallback<Amity.InternalPost> = (
    snapshot: Amity.LiveObject<Amity.InternalPost>,
  ) => {
    const { data } = snapshot;
    callback({ ...snapshot, data: data ? LinkedObject.post(snapshot.data) : data });
  };

  return liveObject(postId, responder, 'postId', _getPost, [
    onPostApproved,
    onPostDeclined,
    onLocalPostReactionAdded,
    onLocalPostReactionRemoved,
    (callback: Amity.Listener<Amity.InternalPost>) => {
      return onPostDeleted((post: Amity.InternalPost) => {
        let targetPost = post;

        // check if the deleted post is a child of the target post
        if (post.parentPostId === postId && post.isDeleted) {
          const parentPost = pullFromCache<Amity.InternalPost>([
            'post',
            'get',
            post.parentPostId,
          ])?.data;

          if (parentPost) {
            parentPost.children = parentPost.children.filter(childId => childId !== post.postId);
            pushToCache(['post', 'get', parentPost.postId], parentPost);

            // if the deleted post is a child of the target post, then the target post is the parent post
            targetPost = parentPost;
          }
        }

        callback(targetPost);
      });
    },
    onPostFlagged,
    (callback: Amity.Listener<Amity.InternalPost>) => {
      return onPostReactionAdded((post: Amity.InternalPost) => {
        callback(LinkedObject.post(post));
      });
    },
    (callback: Amity.Listener<Amity.InternalPost>) => {
      return onPostReactionRemoved((post: Amity.InternalPost) => {
        callback(LinkedObject.post(post));
      });
    },
    onPostUnflagged,
    onPostUpdated,
    onPostUpdatedLocal,
    onLocalPostDeleted,
    convertEventPayload(
      (callback: Amity.Listener<Amity.InternalComment>) => {
        return onCommentCreated(async (comment: Amity.InternalComment) => {
          if (comment.referenceId === postId) {
            await _getPost(postId);
            callback(comment);
          }
        });
      },
      'referenceId',
      'post',
    ),
    convertEventPayload(
      (callback: Amity.Listener<Amity.InternalComment>) => {
        return onCommentDeleted(async (comment: Amity.InternalComment) => {
          if (comment.referenceId === postId) {
            await _getPost(postId);
            callback(comment);
          }
        });
      },
      'referenceId',
      'post',
    ),
  ]);
};
/* end_public_function */
