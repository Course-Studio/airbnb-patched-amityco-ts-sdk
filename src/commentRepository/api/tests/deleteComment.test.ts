import {
  client,
  comment11,
  connectClient,
  disconnectClient,
  emptyPostPayload,
  generateComment,
  generatePost,
  textCommentResponse,
  user11,
} from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { deleteComment } from '../deleteComment';

const commentId = 'comment11';
const commentData = generateComment({ commentId });

const singlePostResponse = {
  data: {
    ...emptyPostPayload,
    posts: [generatePost({ comments: [commentId], commentsCount: 1 })],
    comments: [commentData],
    users: [user11],
  } as Amity.ProcessedPostPayload,
};

describe('deleteComment', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: ff01df65-2cc0-4fd8-8c3e-a12cea5a359b
  test('should return success for soft and hard delete', async () => {
    client.http.get = jest.fn().mockImplementation(url => {
      if (url === '/api/v3/comments/comment11') return textCommentResponse;
      // /api/v3/posts/postId11
      return singlePostResponse;
    });
    client.http.delete = jest.fn().mockResolvedValueOnce({ success: true });

    const result = await deleteComment(commentId);
    expect(result.isDeleted).toEqual(true);
    expect(result.commentId).toEqual(commentId);
  });

  // integration_test_id: 322954d6-bc89-40ae-bd18-691ee0c60105
  test('should return error for deletion not successful', async () => {
    client.http.get = jest.fn().mockImplementation(url => {
      if (url === '/api/v3/comments/comment11') return textCommentResponse;
      // /api/v3/posts/postId11
      return singlePostResponse;
    });
    client.http.delete = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(deleteComment(commentId)).rejects.toThrow();
  });
});
