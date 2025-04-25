/**
 * global task for mark read engines runs when the client is authenticated.
 *
 * NOTE: This task will be refactored again in the future. When the session component improved
 * Relate Ticket: https://ekoapp.atlassian.net/browse/ASC-13542
 */
export declare const markReadEngineOnLoginHandler: () => () => void;
