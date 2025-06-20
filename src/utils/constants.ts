export const COLLECTION_DEFAULT_PAGINATION_LIMIT = 5;
export const COLLECTION_DEFAULT_CACHING_POLICY: Amity.QueryPolicy = 'cache_then_server';
export const ENABLE_CACHE_MESSAGE = 'For using Live Collection feature you need to enable Cache!';
export const LIVE_OBJECT_ENABLE_CACHE_MESSAGE =
  'For using Live Object feature you need to enable Cache!';
export const UNSYNCED_OBJECT_CACHED_AT_MESSAGE =
  'Observing unsynced object is not supported by Live Object.';
export const UNSYNCED_OBJECT_CACHED_AT_VALUE = -5;
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;
export const ACCESS_TOKEN_WATCHER_INTERVAL = 10 * MINUTE;
