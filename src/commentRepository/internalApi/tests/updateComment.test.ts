import { createComment } from '../createComment';
import { updateComment } from '../updateComment';
import { getActiveClient } from '~/client/api';
import {
  client,
  connectClient,
  disconnectClient,
  comment11,
  imageComment11,
  textImageComment11,
  textMentionComment11,
  imageCommentResponse,
  textCommentResponse,
  textImageCommentResponse,
  textMentionCommentResponse,
  imageCommentRequestPayload,
  textCommentRequestPayload,
  textCommentWithMentionRequestPayload,
  textImageCommentRequestPayload,
} from '~/utils/tests';
import { ASCApiError } from '~/core/errors';

describe('updateComment', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // functional and logic test
  [
    {
      // integration_test_id: 1f0c74da-863e-44eb-acf1-3de57b1a0e79
      title: 'update comment with valid data and return a new data',
      mockRequest: textCommentResponse,
      mockFunction: textCommentRequestPayload,
      expectResult: comment11,
      extraCase: [],
    },
    {
      // integration_test_id: 72550ea2-2943-4708-bc36-dd2b4fcf44b7
      title: 'update text comment with mention and returns the new valid comment',
      mockRequest: textMentionCommentResponse,
      mockFunction: textCommentWithMentionRequestPayload,
      expectResult: textMentionComment11,
      extraCase: [],
    },
    {
      // integration_test_id: 9df2ff6c-81b7-4bdd-bcd2-33d9752735ed
      title: 'update an image + text comment and returns the new valid comment',
      mockRequest: textImageCommentResponse,
      mockFunction: textImageCommentRequestPayload,
      expectResult: textImageComment11,
      extraCase: [],
    },
    {
      // integration_test_id: 75c77684-09f3-442e-8089-6d37e2182a65
      title: 'add image to existing comment and returns the new valid comment',
      mockRequest: textImageCommentResponse,
      mockFunction: textImageCommentRequestPayload,
      expectResult: textImageComment11,
      extraCase: [],
    },
    {
      // integration_test_id: b50d7783-ab5e-4473-be3b-08ffe8b5142a
      title: 'remove image from existing comment and returns the new valid comment',
      mockRequest: textCommentResponse,
      mockFunction: textCommentRequestPayload,
      expectResult: comment11,
      extraCase: [{ attachments: [] }],
    },
    {
      // integration_test_id: f31daa63-7214-400a-a7a1-d9b00d37137e
      title: 'remove text from existing media comment and returns the new valid comment',
      mockRequest: imageCommentResponse,
      mockFunction: imageCommentRequestPayload,
      expectResult: imageComment11,
      extraCase: [{ data: { text: '' } }],
    },
  ].forEach(({ title, mockRequest, mockFunction, expectResult, extraCase }) =>
    it(title, async () => {
      client.http.put = jest.fn().mockResolvedValueOnce(mockRequest);

      const newComment = await updateComment(comment11.commentId, mockFunction);

      expect(getActiveClient().http.put).toHaveBeenCalledWith(
        `/api/v3/comments/${comment11.commentId}`,
        mockFunction,
      );
      expect(newComment.data).toEqual(expectResult);

      extraCase.forEach(value => {
        expect(newComment.data).toEqual(expect.objectContaining(value));
      });
    }),
  );

  // Failed case
  [
    {
      // integration_test_id: f2c24783-733e-4a4a-90c4-b518a8d584a1
      title: 'edit text comment with invalid comment_id and returns 400400 error',
      errorCode: Amity.ServerError.ITEM_NOT_FOUND,
      payload: textCommentRequestPayload,
    },
    {
      // integration_test_id: 2f556a4c-2148-4d59-b07e-f415d7c8928c
      title: 'edit text comment which not own by current user and returns 400301 error',
      errorCode: Amity.ServerError.PERMISSION_DENIED,
      payload: textCommentRequestPayload,
    },
  ].forEach(({ title, errorCode, payload }) =>
    it(title, async () => {
      client.http.put = jest
        .fn()
        .mockRejectedValueOnce(new ASCApiError('not found!', errorCode, Amity.ErrorLevel.ERROR));

      await expect(createComment(payload)).rejects.toThrow();
    }),
  );
});
