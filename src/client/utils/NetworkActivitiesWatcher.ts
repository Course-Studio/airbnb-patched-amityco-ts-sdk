type NetworkActivitiesCallback = (
  request: Request,
  response: {
    data: unknown;
    status: number;
    statusText: string;
    headers: Headers;
  },
) => void;

class NetworkActivitiesWatcher {
  private _listener = new Map<NetworkActivitiesCallback, NetworkActivitiesCallback>();

  onNetworkActivities(callback: NetworkActivitiesCallback) {
    this._listener.set(callback, callback);
    return () => {
      this._listener.delete(callback);
    };
  }

  setNetworkActivities(
    request: Request,
    response: {
      data: unknown;
      status: number;
      statusText: string;
      headers: Headers;
    },
  ) {
    this._listener.forEach(cb => cb(request, response));
  }

  destroy() {
    this._listener.clear();
  }
}

let instance: NetworkActivitiesWatcher;

export default {
  getInstance: () => {
    if (!instance) {
      instance = new NetworkActivitiesWatcher();
    }
    return instance;
  },
};
