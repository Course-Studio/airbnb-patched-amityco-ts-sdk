import { enableCache, pushToCache } from '~/cache/api';
import { client, comment11, connectClient, disconnectClient, user11 } from '~/utils/tests';
import { ASCApiError } from '~/core/errors';
import { getCommentByIds } from '../getCommentByIds';

const apiResponse = {
  data: {
    comments: [comment11],
    commentChildren: [],
    users: [user11],
    files: [],
  },
};

const commentsListResponse = {
  data: [comment11],
};

describe('getCommentByIds', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test('Should return the comments from backend', async () => {
    enableCache();
    client.http.get = jest.fn().mockResolvedValueOnce(apiResponse);
    const { data } = await getCommentByIds([comment11.commentId]);
    expect(data).toEqual(commentsListResponse.data);
  });

  test('Should return comments from locally', () => {
    pushToCache(['user', 'get', user11.userId], user11);
    const comments: ReturnType<typeof getCommentByIds.locally> = getCommentByIds.locally([
      comment11.commentId,
    ]);

    expect(comments?.data).toEqual(commentsListResponse.data);
  });

  test('Should return Error: 400400 when getCommentByIds from invalid commentId', async () => {
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCApiError('not found!', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.ERROR),
      );

    await expect(getCommentByIds([comment11.commentId])).rejects.toThrow();
  });
});
