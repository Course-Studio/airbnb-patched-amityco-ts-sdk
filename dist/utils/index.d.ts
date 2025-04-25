export declare function hasMention(model: Amity.Mentionable<'user' | 'channel'>, userId: string): boolean;
export declare function shouldDispatchCollection<T extends Amity.Models[Amity.Domain] & Amity.UpdatedAt>(collection: T[], newItem: T, action: 'onCreate' | string): boolean;
export declare function merge<T extends Amity.Models[Amity.Domain]>(collection1: T[], collection2: T[]): T[];
export declare function isNonNullable<TValue>(value: TValue | undefined | null): value is TValue;
