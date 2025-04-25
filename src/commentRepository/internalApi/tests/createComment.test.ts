import { getActiveClient } from '~/client/api';
import {
  client,
  connectClient,
  disconnectClient,
  comment11,
  imageComment11,
  textImageComment11,
  textMentionComment11,
  comment12,
  post11,
  imageCommentResponse,
  textCommentParentIdResponse,
  textCommentResponse,
  textImageCommentResponse,
  textMentionCommentResponse,
  imageCommentRequestPayload,
  textCommentParentIdRequestPayload,
  textCommentRequestPayload,
  textCommentWithMentionRequestPayload,
  textImageCommentRequestPayload,
} from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { createComment } from '../createComment';

const getPostResponse = {
  data: post11,
  cachedAt: 1673337034544,
};

jest.mock('~/postRepository/api/getPost', () => ({
  getPost: jest.fn(() => Promise.resolve(getPostResponse)),
}));

describe('createComment', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  // integration_test_id: 2f83eabc-46db-43d8-89c6-1b5339d6a273
  it('creates a text comment and returns the new valid comment', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(textCommentResponse);

    const newComment = await createComment(textCommentRequestPayload);

    expect(getActiveClient().http.post).toHaveBeenCalledWith(
      '/api/v3/comments',
      textCommentRequestPayload,
    );
    expect(newComment.data).toEqual(comment11);
  });

  // integration_test_id: 81e7d5bc-6881-4f9b-b8d4-deb5fe67200c
  it('creates a image comment and returns the new valid comment', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(imageCommentResponse);

    const newComment = await createComment(imageCommentRequestPayload);

    expect(getActiveClient().http.post).toHaveBeenCalledWith(
      '/api/v3/comments',
      imageCommentRequestPayload,
    );
    expect(newComment.data).toEqual(imageComment11);
  });

  // integration_test_id: 015838a8-3267-4253-920a-9ae83197cf22
  it('creates an image + text comment and returns the new valid comment', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(textImageCommentResponse);

    const newComment = await createComment(textImageCommentRequestPayload);

    expect(getActiveClient().http.post).toHaveBeenCalledWith(
      '/api/v3/comments',
      textImageCommentRequestPayload,
    );
    expect(newComment.data).toEqual(textImageComment11);
  });

  // integration_test_id: c2285355-f3b6-4e22-926b-11bcf0393161
  it('creates text comment with mention and returns the new valid comment', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(textMentionCommentResponse);

    const newComment = await createComment(textCommentWithMentionRequestPayload);

    expect(getActiveClient().http.post).toHaveBeenCalledWith(
      '/api/v3/comments',
      textCommentWithMentionRequestPayload,
    );
    expect(newComment.data).toEqual(textMentionComment11);
  });

  // integration_test_id: cb1bfe11-c11a-4324-aeb5-03370da820ad
  it('creates text comment with parent_id and returns the new valid comment', async () => {
    client.http.post = jest.fn().mockResolvedValueOnce(textCommentParentIdResponse);

    const newComment = await createComment(textCommentParentIdRequestPayload);

    expect(getActiveClient().http.post).toHaveBeenCalledWith(
      '/api/v3/comments',
      textCommentParentIdRequestPayload,
    );
    expect(newComment.data).toEqual(comment12);
  });

  // integration_test_id: 7f411488-abba-46d1-8707-a1d8adbd7242
  it('creates text comment with invalid parent_id and returns 400400 error', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(createComment(textCommentParentIdRequestPayload)).rejects.toThrow();
  });
});
