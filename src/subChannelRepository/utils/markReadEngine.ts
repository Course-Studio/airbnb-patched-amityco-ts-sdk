import { onSessionStateChange } from '~/client/events/onSessionStateChange';
import { setIntervalTask } from '~/utils/timer';
import { readingAPI } from '../api/readingAPI';

const START_READING_INTERVAL_TIME = 30000;

let isSyncRunning = false;

/**
 * map contains subChannelId and isReading flag to determine which subChannel is on reading state
 */
const isReadingMap: Record<string, boolean> = {};

const getReadingSubChannels = () => {
  return Object.entries(isReadingMap)
    .filter(([, value]) => value)
    .map(([key]) => key);
};

/**
 * call start reading API with reading list
 */
const startReadingFromReadingList = async () => {
  const isReadingSubChannelIds = getReadingSubChannels();

  if (isReadingSubChannelIds.length === 0) {
    // no subChannel that require to call start reading API
    return false;
  }

  return readingAPI(isReadingSubChannelIds);
};

const startIntervalTask = () => {
  isSyncRunning = true;
};

const stopIntervalTask = () => {
  isSyncRunning = false;
};

/**
 * global task for mark read engines runs when the client is authenticated.
 *
 * NOTE: This task will be refactored again in the future. When the session component improved
 * Relate Ticket: https://ekoapp.atlassian.net/browse/ASC-13542
 */
export const markReadEngineOnLoginHandler = () => {
  startIntervalTask();

  onSessionStateChange(state => {
    if (state === Amity.SessionStates.NOT_LOGGED_IN) {
      stopIntervalTask();
    }
  });

  return () => {
    stopIntervalTask();
  };
};

setIntervalTask(async () => {
  if (!isSyncRunning) return;

  await startReadingFromReadingList();
}, START_READING_INTERVAL_TIME);
