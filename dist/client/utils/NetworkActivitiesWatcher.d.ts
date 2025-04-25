type NetworkActivitiesCallback = (request: Request, response: {
    data: unknown;
    status: number;
    statusText: string;
    headers: Headers;
}) => void;
declare class NetworkActivitiesWatcher {
    private _listener;
    onNetworkActivities(callback: NetworkActivitiesCallback): () => void;
    setNetworkActivities(request: Request, response: {
        data: unknown;
        status: number;
        statusText: string;
        headers: Headers;
    }): void;
    destroy(): void;
}
declare const _default: {
    getInstance: () => NetworkActivitiesWatcher;
};
export default _default;
