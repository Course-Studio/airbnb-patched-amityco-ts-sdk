/**
 * ```js
 * import { deleteReport } from '@amityco/ts-sdk'
 * const unflagged = await deleteReport('post', postId)
 * ```
 *
 * @param referenceType The type of thing to delete a report to, such as a post or a comment.
 * @param referenceId The ID of the thing to delete a report to.
 * @returns the deleted report result
 *
 * @category Report API
 * @async
 * */
export declare const deleteReport: (referenceType: "user" | "message" | "post" | "comment", referenceId: string) => Promise<boolean>;
