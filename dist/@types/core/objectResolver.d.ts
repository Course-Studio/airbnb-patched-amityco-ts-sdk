export {};
declare global {
    namespace Amity {
        const enum ReferenceType {
            CHANNEL = "channel",
            USER_MESSAGE_FEED_MARKER = "userMessageFeedMarker"
        }
        type ObjectIdBuffer = {
            [key in ReferenceType]: string[];
        };
    }
}
