export const onOffline = (callback: () => void) => {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  }

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('offline', callback);
    return () => document.removeEventListener('offline', callback);
  }

  // Handle unsupported environment
  console.error('Unsupported environment');
  return () => console.error('Unsupported environment');
};
