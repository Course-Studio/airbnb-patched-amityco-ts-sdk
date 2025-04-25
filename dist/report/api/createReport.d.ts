/**
 * ```js
 * import { createReport } from '@amityco/ts-sdk'
 * const flagged = await createReport('post', postId)
 * ```
 *
 * @param referenceType The type of thing to add a report to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new report to.
 * @returns the created report result
 *
 * @category Report API
 * @async
 * */
export declare const createReport: (referenceType: 'post' | 'comment' | 'message' | 'user', referenceId: string) => Promise<boolean>;
//# sourceMappingURL=createReport.d.ts.map