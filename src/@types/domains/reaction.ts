export {};

declare global {
  namespace Amity {
    const enum ReactionActionTypeEnum {
      OnAdded = 'onAdded',
      OnRemoved = 'onRemoved',
    }

    type ReactableType = 'message' | 'post' | 'comment' | 'story';

    type InternalReactor = {
      reactionId: string;
      reactionName: string;
      userId: Amity.InternalUser['userId'];
    } & {
      createdAt?: string;
      updatedAt?: string;
    };

    type ReactorLinkedObject = {
      user?: Amity.User;
    };

    type Reactor = Amity.InternalReactor & Amity.ReactorLinkedObject;

    type Reactable = {
      reactionsCount: number;
      reactions: Record<string, number>;
      myReactions?: string[];
    };

    type Reaction = {
      reactors: InternalReactor[];
    } & Amity.Relationship<ReactableType>;

    type QueryReactions = {
      referenceId: Amity.Reaction['referenceId'];
      referenceType: Amity.Reaction['referenceType'];
      reactionName?: Amity.InternalReactor['reactionName'];
      page?: Amity.Page<string>;
    };

    type ReactionLiveCollection = Amity.LiveCollectionParams<Omit<QueryReactions, 'page'>>;

    type ReactionLiveCollectionCache = Amity.LiveCollectionCache<
      Amity.InternalReactor['reactionId'],
      Pick<QueryReactions, 'page'>
    >;
  }
}
