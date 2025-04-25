import { connectClient, disconnectClient } from '~/utils/tests';
import { setSessionState } from '~/client/api/setSessionState';
import { onSessionStateChange } from '../onSessionStateChange';

describe('onSessionStateChange', () => {
  beforeAll(async () => {
    await connectClient();
  });

  afterAll(async () => {
    await disconnectClient();
  });

  test('it should call callback on event', () => {
    const callback = jest.fn();
    const expected = Amity.SessionStates.ESTABLISHED;

    const unsub = onSessionStateChange(callback);
    setSessionState(expected);
    expect(callback).toHaveBeenCalledWith(expected);
    unsub();
  });

  test('it should not call callback if unsubscribed', () => {
    const callback = jest.fn();
    const state = Amity.SessionStates.ESTABLISHED;

    const unsub = onSessionStateChange(callback);
    unsub();
    setSessionState(state);
    expect(callback).not.toHaveBeenCalled();
  });
});
