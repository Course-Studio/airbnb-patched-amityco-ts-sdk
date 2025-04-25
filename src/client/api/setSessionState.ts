import { ASCError } from '~/core/errors';

import SessionWatcher from '~/client/utils/SessionWatcher';
import { getActiveClient } from './activeClient';

/*
 * Session States cannot be set arbitrarily.
 * These are the possible new states based on the current state
 * Check tech spec for details:
 * https://ekoapp.atlassian.net/wiki/spaces/UP/pages/2082537485/ASC+Core+-+Session+Management+3.0#Session-State
 */
const sessionStateTransitions: Record<Amity.SessionStates, Amity.SessionStates[]> = {
  // notLoggedIn -> establishing
  [Amity.SessionStates.NOT_LOGGED_IN]: [Amity.SessionStates.ESTABLISHING],
  // terminated -> establishing
  [Amity.SessionStates.TERMINATED]: [Amity.SessionStates.ESTABLISHING],
  // establishing -> notLoggedIn, established
  [Amity.SessionStates.ESTABLISHING]: [
    Amity.SessionStates.NOT_LOGGED_IN,
    Amity.SessionStates.ESTABLISHED,
  ],
  /*
   * established -> notLoggedIn, terminated, tokenExpired, establishing (for
   * cases when logging in the same user)
   */
  [Amity.SessionStates.ESTABLISHED]: [
    Amity.SessionStates.NOT_LOGGED_IN,
    Amity.SessionStates.TERMINATED,
    Amity.SessionStates.TOKEN_EXPIRED,
    Amity.SessionStates.ESTABLISHING,
  ],
  // tokenExpired -> establishing
  [Amity.SessionStates.TOKEN_EXPIRED]: [Amity.SessionStates.ESTABLISHING],
};

export const isValidStateChange = (
  prevState: Amity.SessionStates,
  nextState: Amity.SessionStates,
): boolean => {
  return sessionStateTransitions[prevState].includes(nextState);
};

/**
 * Checks if a {@link Amity.Client} instance is connected to ASC servers
 *
 *
 * @param state the new session state
 * @returns a success boolean if connected
 *
 * @category private
 */
export const setSessionState = (state: Amity.SessionStates): boolean => {
  const client = getActiveClient();

  client.log('client/api/setSessionState', state);

  const { sessionState: prevState } = client;

  if (prevState === state) return false;

  // check if transition is valid
  if (!isValidStateChange(prevState, state)) {
    throw new ASCError(
      `Session state cannot change from ${prevState} to ${state}`,
      Amity.ClientError.UNKNOWN_ERROR,
      Amity.ErrorLevel.ERROR,
    );
  }

  client.sessionState = state;

  SessionWatcher.getInstance().setSessionState(state);

  return true;
};
