import { disableCache } from '~/cache/api';
import { client, connectClient, disconnectClient } from '~/utils/tests';

import { createReport } from '..';
import REFERENCE_TYPES from '../../constants/referenceTypes';

describe('createReport', () => {
  beforeEach(disableCache);
  beforeAll(connectClient);
  afterAll(disconnectClient);

  test.todo('it should fire event for flagging message');
  test.todo('it should fire event for flagging post');

  const tests: [keyof typeof REFERENCE_TYPES, string, string][] = [
    ['post', 'postId', `/api/v3/posts/${encodeURIComponent('postId')}/flag`],
    ['message', 'messageId', `/api/v5/messages/${encodeURIComponent('messageId')}/flags`],
  ];

  test.each(tests)(
    'it should call the appropriate api for %s',
    async (referenceType, referenceId, expected) => {
      const apimock = jest.fn();

      client.http.post = apimock.mockResolvedValue({ data: {} });

      await createReport(referenceType, referenceId);

      const received = apimock.mock.lastCall[0];

      expect(received).toBe(expected);
    },
  );
});
