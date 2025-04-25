export const onOnline = (callback: () => void) => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  }

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('online', callback);
    return () => document.removeEventListener('online', callback);
  }

  // Handle unsupported environment
  console.error('Unsupported environment');
  return () => console.error('Unsupported environment');
};
