import nock from 'nock';

import { ASCApiError, ASCUnknownError, ASCError } from '~/core/errors';
import { createFileFormData } from '~/utils/tests';

import { getPastDate, getFutureDate } from '~/core/model';
import { createHttpTransport, RequestCancelation } from '../http';

const baseUrl = 'https://non-exist.domain';

describe('core/transports', () => {
  describe('createHttpTransport', () => {
    beforeAll(nock.disableNetConnect);
    beforeEach(nock.cleanAll);

    test('should create axios instance with out error', () => {
      nock(baseUrl).get(/./).reply(200);

      expect(createHttpTransport(baseUrl)).not.toThrow();
    });

    test('instance should resolved http request', async () => {
      const expectedResolveValue = { foo: 'bar' };
      nock(baseUrl).get('/foo').reply(200, expectedResolveValue);

      const instance = createHttpTransport(baseUrl);

      const expected = expect.objectContaining({ data: expectedResolveValue });
      await expect(instance.get('/foo')).resolves.toEqual(expected);
    });

    test('instance should throw Error when got 400 response code', async () => {
      nock(baseUrl).get('/foo').reply(400);

      const instance = createHttpTransport(baseUrl);

      await expect(instance.get('/foo')).rejects.toThrow(Error);
    });

    test('instance should throw Error when got 500 response code', async () => {
      nock(baseUrl).get('/foo').reply(500);

      const instance = createHttpTransport(baseUrl);

      await expect(instance.get('/foo')).rejects.toThrow(Error);
    });

    test('instance should throw `ASCUnknownError` when got `fail` status in payload', async () => {
      nock(baseUrl).get('/foo').reply(500, { status: 'fail', message: 'something fail' });

      const instance = createHttpTransport(baseUrl);

      await expect(instance.get('/foo')).rejects.toThrow(ASCUnknownError);
    });

    test('instance should throw `ASCApiError` when got `error` status in payload', async () => {
      nock(baseUrl).get('/foo').reply(500, { status: 'error', message: 'something error' });

      const instance = createHttpTransport(baseUrl);

      await expect(instance.get('/foo')).rejects.toThrow(ASCApiError);
    });

    test('instance should receive formData', async () => {
      const formData = createFileFormData();
      nock(baseUrl).post('/foo').reply(200);

      const instance = createHttpTransport(baseUrl);

      await expect(instance.post('/foo', formData)).resolves.not.toThrow();
    });

    test('should not check token expiration for token creation url', async () => {
      const expectedResolveValue = { foo: 'bar' };
      nock(baseUrl).get('/api/v5/sessions').reply(200, expectedResolveValue);

      const instance = createHttpTransport(baseUrl);
      instance.defaults.metadata = {
        tokenExpiry: getPastDate(),
        isGlobalBanned: false,
        isUserDeleted: false,
      };

      const expected = expect.objectContaining({ data: expectedResolveValue });
      await expect(instance.get('/api/v5/sessions')).resolves.toEqual(expected);
    });

    test('it should throw error is user is global banned', async () => {
      const err = new ASCError(
        RequestCancelation.UserGlobalBanned,
        Amity.ServerError.GLOBAL_BAN,
        Amity.ErrorLevel.FATAL,
      );

      const instance = createHttpTransport(baseUrl);
      instance.defaults.metadata = {
        tokenExpiry: getFutureDate(),
        isGlobalBanned: true,
        isUserDeleted: false,
      };

      await expect(instance.get('/foo')).rejects.toThrow(err);
    });

    test('it should throw error is user is deleted', async () => {
      const err = new ASCError(
        RequestCancelation.UserDeleted,
        Amity.ServerError.UNAUTHORIZED,
        Amity.ErrorLevel.FATAL,
      );

      const instance = createHttpTransport(baseUrl);
      instance.defaults.metadata = {
        tokenExpiry: getFutureDate(),
        isGlobalBanned: false,
        isUserDeleted: true,
      };

      await expect(instance.get('/foo')).rejects.toThrow(err);
    });
  });
});
