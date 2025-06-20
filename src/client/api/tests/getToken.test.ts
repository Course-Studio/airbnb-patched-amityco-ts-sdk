import { client, user11, sessionResponse } from '~/utils/tests';

import { getToken } from '../getToken';

describe('getToken', () => {
  const { userId } = user11;
  const displayName = 'test-displayName';
  const deviceId = 'test-deviceId';
  const params = { userId, displayName, deviceId };

  test('it should call v5/sessions api', async () => {
    const expected = '/api/v5/sessions';
    const mockApi = jest.fn().mockResolvedValue(sessionResponse);
    client.http.post = mockApi;

    await getToken({ params });
    const [recieved] = mockApi.mock.lastCall;

    expect(recieved).toBe(expected);
  });

  test('it should return token', async () => {
    const expected = sessionResponse.data;
    client.http.post = jest.fn().mockResolvedValue(sessionResponse);

    const recieved = await getToken({ params });

    expect(recieved).toStrictEqual(expected);
  });

  test('it should throw error', async () => {
    client.http.post = jest.fn().mockRejectedValue(new Error('error'));

    await expect(getToken({ params })).rejects.toThrow();
  });
});
