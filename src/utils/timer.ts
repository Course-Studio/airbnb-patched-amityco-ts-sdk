export const setIntervalTask = (handler: () => void, timeout: number) => {
  const timer = setInterval(handler, timeout);
  return () => clearInterval(timer);
};
