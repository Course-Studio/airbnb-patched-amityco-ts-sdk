type SessionStateCallback = (state: Amity.SessionStates) => void;
declare class SessionWatcher {
    private _sessionState;
    private _listener;
    onSessionStateChange(callback: SessionStateCallback): () => void;
    setSessionState(state: Amity.SessionStates): void;
    destroy(): void;
}
declare const _default: {
    getInstance: () => SessionWatcher;
};
export default _default;
