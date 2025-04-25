type SessionStateCallback = (state: Amity.SessionStates) => void;

class SessionWatcher {
  private _sessionState: Amity.SessionStates = Amity.SessionStates.NOT_LOGGED_IN;

  private _listener = new Map<SessionStateCallback, SessionStateCallback>();

  onSessionStateChange(callback: SessionStateCallback) {
    this._listener.set(callback, callback);
    return () => {
      this._listener.delete(callback);
    };
  }

  setSessionState(state: Amity.SessionStates) {
    if (this._sessionState === state) return;
    this._sessionState = state;
    this._listener.forEach(cb => cb(state));
  }

  destroy() {
    this._listener.clear();
  }
}

let instance: SessionWatcher;

export default {
  getInstance: () => {
    if (!instance) {
      instance = new SessionWatcher();
    }
    return instance;
  },
};
