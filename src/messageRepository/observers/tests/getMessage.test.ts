import { ASCApiError } from '~/core/errors';
import { disableCache, enableCache } from '~/cache/api';
import { UNSYNCED_OBJECT_CACHED_AT_MESSAGE } from '~/utils/constants';
import {
  pause,
  client,
  connectClient,
  disconnectClient,
  generateRawMessage,
  convertRawMessage,
} from '~/utils/tests';
import { getFutureDate } from '~/core/model';

import { getMessage } from '../getMessage';
import { createMessage } from '../../api';
import * as getMessageMarkers from '../../../marker/api/getMessageMarkers';

const rawMessage = generateRawMessage();
const message = convertRawMessage(rawMessage);
const messageQueryResponseRaw = {
  data: { messages: [rawMessage] },
};

const getSnapshot = () => {
  return {
    loading: true,
    error: undefined as any,
    data: undefined as undefined | Amity.Message,
  };
};

describe('getMessage', () => {
  beforeAll(() => {
    connectClient();

    jest.spyOn(getMessageMarkers, 'getMessageMarkers').mockImplementation(() =>
      Promise.resolve({
        data: [],
        cachedAt: undefined,
      }),
    );
  });

  afterAll(disconnectClient);

  beforeEach(enableCache);
  afterEach(disableCache);

  const events: [string, keyof Amity.Events][] = [
    ['it should return updated message on onFetch', 'local.message.fetched'],
    ['it should return updated message on onUpdate', 'message.updated'],
    ['it should return updated message on onDelete', 'message.deleted'],
    ['it should return updated message on onFlagged', 'message.flagged'],
    ['it should return updated message on onUnflagged', 'message.unflagged'],
    ['it should return updated message on onFlagCleared', 'message.flagCleared'],
    ['it should return updated message on onReactionAdded', 'message.reactionAdded'],
    ['it should return updated message on onReactionRemoved', 'message.reactionRemoved'],
  ];

  test.each(events)('%s', async (test, event) => {
    disableCache();
    const snapshot = getSnapshot();

    // mock response of queryMessages and validate
    const callback = jest.fn();
    client.http.get = jest.fn().mockResolvedValue(messageQueryResponseRaw);

    getMessage(message.messageId, callback);

    await pause();

    expect(callback).toHaveBeenCalledTimes(2);

    const rawUpdatedMessage = {
      ...rawMessage,
      data: { text: event },
      updatedAt: getFutureDate(rawMessage.updatedAt),
    };
    const updatedMessage = convertRawMessage(rawUpdatedMessage);
    if (event === 'local.message.fetched') {
      client.emitter.emit('local.message.fetched', { messages: [updatedMessage] });
    } else {
      client.emitter.emit(event, {
        messages: [rawUpdatedMessage],
        users: [],
        files: [],
      });
    }
    await pause();

    delete snapshot.error;
    snapshot.loading = false;
    snapshot.data = updatedMessage;
    expect(callback.mock.calls[2][0]).toMatchObject(snapshot);
  });

  test('it should terminate updates for unsynced object', async () => {
    const callback = jest.fn();
    client.http.get = jest.fn();
    const snapshot = getSnapshot();
    const data = { subChannelId: 'test', data: { text: 'text' } };

    const message = createMessage.optimistically(data);

    const error = new ASCApiError(
      UNSYNCED_OBJECT_CACHED_AT_MESSAGE,
      Amity.ClientError.DISALOOW_UNSYNCED_OBJECT,
      Amity.ErrorLevel.ERROR,
    );

    getMessage(message!.data.messageId, callback);

    expect(callback).toHaveBeenCalledTimes(1);

    snapshot.error = error;
    snapshot.loading = false;
    snapshot.data = message!.data;
    expect(callback).toHaveBeenLastCalledWith(expect.objectContaining(snapshot));
  });
});
