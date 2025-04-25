/**
 * ```js
 * import { StoryRepository } from '@amityco/ts-sdk'
 * StoryRepository.createVideoStory('community', 'communityId', formData, metadata, items)
 * ```
 *
 * Create a new video story
 * @param targetType
 * @param targetId
 * @param formData
 * @param metadata
 * @param items
 */
export declare const createVideoStory: (targetType: Amity.InternalStory['targetType'], targetId: Amity.InternalStory['targetId'], formData: FormData, metadata?: Amity.Metadata, items?: Amity.StoryItem[]) => Promise<Amity.Cached<Amity.Story | undefined>>;
//# sourceMappingURL=createVideoStory.d.ts.map