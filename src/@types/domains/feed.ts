export {};

declare global {
  namespace Amity {
    type Feed = {
      feedId: string;
      feedType: 'reviewing' | 'published';
      targetType: Extract<Amity.Domain, 'community' | 'user'>;
      targetId: string;
      postCount: number;
    } & Amity.Timestamps;

    type QueryGlobalFeed = {
      dataType?: 'video' | 'image' | 'file' | 'liveStream';
      queryToken?: string;
    };
  }
}
