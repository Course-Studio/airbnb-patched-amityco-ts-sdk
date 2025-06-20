import io from 'socket.io-client';
import { unwrapPayload } from './utils';

/**
 * Creates a pre-configured socket.io instance
 *
 * @param endpoint The socket.io server's URL
 * @returns A pre-configured (non-connected) socket.io client instance
 *
 * @category Transport
 * @hidden
 */
export const createWebsocketTransport = (endpoint: string) => {
  const socket = io(endpoint, {
    autoConnect: false,
    reconnectionDelay: 2000,
    transports: ['websocket'],
  });

  // FIXME: disconnectClient removes this listener and client can get global ban event
  socket.on('disconnect', (reason: string) => {
    if (reason === 'io server disconnect') socket.connect();
  });

  return socket;
};

/**
 * Promisify a websocket event emission - resulting in a synchronous http-like XHR (ws legacy)
 *
 * @param client The current client for which to send the event with
 * @param event The websocket event name
 * @param data The event's payload
 *
 * @returns The data returned by the backend
 * @throws An error related to backend's rejection
 *
 * @category Transport
 * @async
 * @hidden
 */
export const synchronousWSCall = async <T>(
  client: Amity.Client,
  event: string,
  data?: Record<string, unknown>,
) => {
  const { ws } = client;

  const value = await new Promise<T | undefined>((resolve, reject) => {
    ws?.emit(event, data, (response: Amity.Response<T>) => {
      try {
        resolve(unwrapPayload(response));
      } catch (error) {
        reject(error);
      }
    });
  });

  return value;
};
