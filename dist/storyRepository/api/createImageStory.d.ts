/**
 * ```js
 * import { StoryRepository } from '@amityco/ts-sdk'
 * StoryRepository.createImageStory('community', 'communityId', formData, metadata, imageDisplayMode, items)
 * ```
 *
 * Create a new image story
 * @param targetType The type of the target
 * @param targetId The id of the target
 * @param formData The form data
 * @param metadata The metadata
 * @param imageDisplayMode The image display mode
 * @param items The story items
 * @returns The created story
 */
export declare const createImageStory: (targetType: Amity.InternalStory['targetType'], targetId: Amity.InternalStory['targetId'], formData: FormData, metadata?: Amity.Metadata, imageDisplayMode?: Amity.ImageDisplayMode, items?: Amity.StoryItem[]) => Promise<Amity.Cached<Amity.Story | undefined>>;
//# sourceMappingURL=createImageStory.d.ts.map