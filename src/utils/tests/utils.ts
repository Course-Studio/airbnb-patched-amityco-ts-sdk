import { encode } from 'js-base64';

export const encodeJson = (value: Record<string, any>) => encode(JSON.stringify(value));

/*
 * Used instead of asserting an async request is completed, when the async
 * request is not the API being tested. This util makes tests readable by moving
 * all assertions to the end of the test
 *
 * Use 500ms by default on MacBook Pro Core-i5 2020. Lower than this is not enough
 * to wait for async task before assertions.
 */
export const pause = (ms = 500) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const deepCopy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
