export {};
declare global {
    namespace Amity {
        type PollDataType = 'text';
        type PollAnswerType = 'single' | 'multiple';
        type PollAnswer = {
            id: string;
            dataType: PollDataType;
            data: string;
            voteCount: number;
            isVotedByUser: boolean;
        };
        type PollStatus = 'closed' | 'open';
        type RawPoll = {
            pollId: string;
            question: string;
            answers: PollAnswer[];
            answerType: PollAnswerType;
            closedAt?: Amity.timestamp;
            closedIn?: number;
            isVoted?: boolean;
            status: PollStatus;
            userId: Amity.InternalUser['userId'];
        } & Amity.Timestamps & Amity.SoftDelete;
        type InternalPoll = RawPoll;
        type Poll = InternalPoll;
    }
}
//# sourceMappingURL=poll.d.ts.map