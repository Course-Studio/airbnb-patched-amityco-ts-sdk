import {
  client,
  connectClient,
  disconnectClient,
  generatePost,
  generateComment,
} from '~/utils/tests';
import { disableCache, enableCache } from '~/cache/api';

import { softDeleteComment } from '../softDeleteComment';

const getPostResponse = {
  data: generatePost,
  cachedAt: 1673337034544,
};

jest.mock('~/postRepository/api/getPost', () => ({
  getPost: jest.fn(() => Promise.resolve(getPostResponse)),
}));

describe('softDeleteComment', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  /*
   * this is the only test required as the rest should be tested in
   * deleteComment.test.ts
   */
  test('it should call the api with the correct param', async () => {
    const mockApi = jest.fn().mockResolvedValue({ data: {} });
    const commentId = 'comment-id';
    const expected = { params: { permanent: false, commentId } };

    // mock get comment
    client.http.get = jest.fn().mockResolvedValue({
      data: {
        comments: [{ ...generateComment(), commentId: 'comment-id' }],
        commentChildren: [],
      },
    });
    client.http.delete = mockApi;

    await softDeleteComment(commentId);

    const recieved = mockApi.mock.lastCall[1];

    expect(recieved).toStrictEqual(expected);
  });
});
