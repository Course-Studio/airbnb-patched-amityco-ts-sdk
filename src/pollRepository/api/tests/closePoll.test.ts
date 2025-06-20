import { client, pause, poll11 } from '~/utils/tests';
import { ASCError } from '~/core/errors';
import { disableCache, enableCache } from '~/cache/api';
import { onPollUpdated } from '~/pollRepository/events';
import { closePoll } from '../closePoll';
import { getPoll } from '../getPoll';

describe('closePoll', () => {
  beforeAll(enableCache);
  afterAll(disableCache);

  // integration_test_id: b679db23-6a49-4858-ba53-2b64ced2f587
  it('should close the poll', async () => {
    client.http.put = jest
      .fn()
      .mockResolvedValueOnce({ data: { polls: [{ ...poll11, status: 'closed' }] } });
    const callback = jest.fn();
    onPollUpdated(callback);

    const { data: poll } = await closePoll(poll11.pollId);
    const { data: cachedPoll } = getPoll.locally(poll.pollId)!;
    await pause();

    expect(poll.status).toEqual('closed');
    expect(cachedPoll).toMatchObject(poll);
    expect(callback).toHaveBeenCalledWith(poll);
  });

  // integration_test_id: ec12e345-0e93-435b-9750-e81408fcb791
  it('should fail to close if the poll does not exist', async () => {
    client.http.put = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCError('error message', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.FATAL),
      );

    await expect(() => closePoll('non-existent-poll-id')).rejects.toThrow();
  });

  // integration_test_id: ed6ea62d-199c-4446-a3c3-554812707b42
  it('should fail to close if user does not have permissions', async () => {
    client.http.put = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCError('error message', Amity.ServerError.FORBIDDEN, Amity.ErrorLevel.FATAL),
      );

    await expect(() => closePoll('no-permissions-poll-id')).rejects.toThrow();
  });
});
