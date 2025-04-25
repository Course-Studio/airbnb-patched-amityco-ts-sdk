/**
 * ```js
 * import { isReportedByMe } from '@amityco/ts-sdk'
 * const isReported = await isReportedByMe('post', postId)
 * ```
 *
 * @param referenceType The type of thing to check a report to, such as a post or a comment.
 * @param referenceId The ID of the thing to check a report to.
 * @returns `true` if the report is created by me, `false` if doesn't.
 *
 * @category Report API
 * @async
 * */
export declare const isReportedByMe: (referenceType: 'user' | 'message' | 'post' | 'comment', referenceId: string) => Promise<boolean>;
//# sourceMappingURL=isReportedByMe.d.ts.map