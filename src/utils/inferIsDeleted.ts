/*
 * This is a simple utility that infers the value of isDeleted based on the
 * value of includeDeleted
 *
 * There are two important things to note here:
 *  1. `includeDeleted` is purely client side query param and not recognized by
 *  the server
 *  2. The only values we wish to expose with regards to `isDeleted` (the server
 *  param for queries) is false | undefined and want to disallow users to query
 *  for deleted entities
 *
 *  Although this is a very simple utility, it's only purpose is to keep things
 *  DRY
 */
export const inferIsDeleted = (includeDeleted?: boolean): boolean | undefined =>
  includeDeleted === true ? undefined : false;
