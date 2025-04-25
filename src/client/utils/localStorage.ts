class OnMemoryStorage {
  private store: { [key: string]: string } = {};

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(i: number): string | null {
    const keys = Object.keys(this.store);
    // @ts-ignore
    return keys[i] || null;
  }
}

const windowInstance = () => {
  if (typeof window !== 'undefined' && window.localStorage) return window;
  // For JEST
  return { localStorage: new OnMemoryStorage() };
};

export const setItem = async (key: string, value: string): Promise<boolean> => {
  return new Promise(resolve => {
    windowInstance().localStorage.setItem(key, value);
    resolve(true);
  });
};

export const getItem = async (key: string): Promise<string | null | undefined> => {
  return new Promise(resolve => {
    const value = windowInstance().localStorage.getItem(key);
    resolve(value);
  });
};
