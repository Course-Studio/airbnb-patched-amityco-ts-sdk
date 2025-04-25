/** @hidden */
export declare const prepareReactionPayloadFromEvent: <T extends "post.addReaction" | "post.removeReaction" | "comment.addReaction" | "comment.removeReaction", P extends Amity.Events[T]>(event: T, payload: P) => P;
export declare const prepareStoryReactionPayloadFormEvent: <T extends "story.reactionAdded" | "story.reactionRemoved", P extends Amity.Events[T]>(event: T, payload: P) => P;
export declare const prepareCommentFromFlaggedEvent: (payload: Amity.CommentPayload) => Amity.CommentPayload<any> & {
    [x: string]: any[];
};
