export const convertDateStringToTimestamp = (dateString: string) => {
  return new Date(dateString).getTime();
};
