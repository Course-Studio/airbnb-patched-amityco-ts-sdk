import { client, pause, poll11 } from '~/utils/tests';
import { ASCError } from '~/core/errors';
import { disableCache, enableCache } from '~/cache/api';
import { onPollUpdated } from '~/pollRepository/events';
import { votePoll } from '../votePoll';
import { getPoll } from '../getPoll';

describe('votePoll', () => {
  beforeAll(enableCache);
  afterAll(disableCache);

  // integration_test_id: 2abcbca5-f845-4e96-9405-23781013738e
  it('should vote', async () => {
    client.http.post = jest
      .fn()
      .mockResolvedValueOnce({ data: { polls: [{ ...poll11, isVoted: true }] } });
    const callback = jest.fn();
    onPollUpdated(callback);

    const { data: poll } = await votePoll(poll11.pollId, [poll11.answers[0].id]);
    const { data: cachedPoll } = getPoll.locally(poll.pollId)!;
    await pause();

    expect(poll.isVoted).toEqual(true);
    expect(cachedPoll).toMatchObject(poll);
    expect(callback).toHaveBeenCalledWith(poll);
  });

  // integration_test_id: b6ab2681-7f25-47a0-bc14-f4f542a3cf80
  it('should fail to vote for in an invalid poll', async () => {
    client.http.post = jest
      .fn()
      .mockRejectedValueOnce(
        new ASCError('error message', Amity.ServerError.ITEM_NOT_FOUND, Amity.ErrorLevel.FATAL),
      );

    await expect(() =>
      votePoll('non-existent-poll-id', ['non-existent-answer-id']),
    ).rejects.toThrow();
  });
});
