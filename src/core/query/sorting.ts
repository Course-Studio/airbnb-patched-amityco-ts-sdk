// Note:
// this file should contain a suite of sorting utilities to help the
// local version of the query functions.

type SortingFunc<T = Record<string, unknown>> = (a: T, b: T) => number;

/**
 * Alphabetic sorting of objects having a displayName
 */
export const sortByDisplayName: SortingFunc<{ displayName?: string }> = (
  { displayName: a },
  { displayName: b },
) => {
  if (a && b) return a.localeCompare(b);
  return a ? -1 : 1;
};

/**
 * Alphabetic sorting of objects having a name
 */
export const sortByName: SortingFunc<{ name?: string }> = ({ name: a }, { name: b }) => {
  if (a && b) return a.localeCompare(b);
  return a ? -1 : 1;
};

/**
 * Sorting a collection by their apparition order (oldest first)
 */
export const sortByChannelSegment: SortingFunc<{ channelSegment: number }> = (
  { channelSegment: a },
  { channelSegment: b },
) => a - b;

/**
 * Sorting a collection by their apparition order (oldest first)
 */
export const sortBySegmentNumber: SortingFunc<{ segmentNumber: number }> = (
  { segmentNumber: a },
  { segmentNumber: b },
) => a - b;

/**
 * Sorting a collection by its oldest items
 */
export const sortByFirstCreated: SortingFunc<{ createdAt: Date | number | string }> = (
  { createdAt: a },
  { createdAt: b },
) => new Date(a).valueOf() - new Date(b).valueOf();

/**
 * Sorting a story-collection by its localSortingDate
 */
export const sortByLocalSortingDate: SortingFunc<{
  localSortingDate: Date | number | string;
}> = ({ localSortingDate: a }, { localSortingDate: b }) =>
  new Date(b).getTime() - new Date(a).getTime();

/**
 * Sorting a collection by its newest items
 */
export const sortByLastCreated: SortingFunc<{ createdAt: Date | number | string }> = (
  { createdAt: a },
  { createdAt: b },
) => new Date(b).valueOf() - new Date(a).valueOf();

/**
 * Sorting a collection by its oldest items
 * -- Due to Amity.UpdatedAt is an optional type, we need to define a default value to 0 to prevent error
 */
export const sortByFirstUpdated: SortingFunc<{ updatedAt?: Date | number | string }> = (
  { updatedAt: a = 0 },
  { updatedAt: b = 0 },
) => new Date(a).valueOf() - new Date(b).valueOf();

/**
 * Sorting a collection by its newest items
 * -- Due to Amity.UpdatedAt is an optional type, we need to define a default value to 0 to prevent error
 */
export const sortByLastUpdated: SortingFunc<{ updatedAt?: Date | number | string }> = (
  { updatedAt: a = 0 },
  { updatedAt: b = 0 },
) => new Date(b).valueOf() - new Date(a).valueOf();

/**
 * Sorting a collection by the items with most recent activity
 */
export const sortByLastActivity: SortingFunc<{ lastActivity: Date | number | string }> = (
  { lastActivity: a },
  { lastActivity: b },
) => new Date(b).valueOf() - new Date(a).valueOf();
