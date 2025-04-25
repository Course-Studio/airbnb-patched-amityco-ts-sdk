/**
 * ```js
 * import { FileRepository } from '@amityco/ts-sdk'
 * const created = await FileRepository.uploadVideo(formData)
 * ```
 *
 * Creates an {@link Amity.File<'video'>}
 *
 * @param formData The data necessary to create a new {@link Amity.File<'video'>}
 * @param feedType The {@link Amity.File<'video'>} feed type
 * @param onProgress The callback to track the upload progress
 * @returns The newly uploaded {@link Amity.File<'video'>}
 *
 * @category File API
 * @async
 */
export declare const uploadVideo: (formData: FormData, feedType?: Amity.ContentFeedType, onProgress?: ((percent: number) => void) | undefined) => Promise<Amity.Cached<Amity.File<'video'>[]>>;
//# sourceMappingURL=uploadVideo.d.ts.map