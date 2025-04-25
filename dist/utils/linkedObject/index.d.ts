export declare const LinkedObject: {
    ad: (ad: Amity.InternalAd) => Amity.Ad;
    comment: (comment: Amity.InternalComment) => Amity.Comment;
    post: (post: Amity.InternalPost) => Amity.Post;
    user: (user: Amity.InternalUser) => Amity.User;
    category: (category: Amity.InternalCategory) => Amity.Category;
    stream: (stream: Amity.InternalStream) => Amity.Stream;
    story: (story: Amity.InternalStory) => Amity.Story;
    storyTarget: (storyTarget: Amity.RawStoryTarget) => Amity.StoryTarget;
    message: (message: Amity.InternalMessage) => Amity.Message;
    reactor: (reactor: Amity.InternalReactor) => Amity.Reactor;
    channel: (channel: Amity.InternalChannel) => Amity.Channel;
    pinnedPost: (pinnedPost: Amity.RawPin) => Amity.PinnedPost;
    notificationTray: (noti: Amity.InternalNotificationTrayItem) => Amity.NotificationTrayItem;
};
