
/**
 * Enhanced localStorage utility with persistence and error handling
 */

export const persistentStorage = {
  /**
   * Set an item in localStorage with error handling
   */
  setItem: (key: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      
      // Force persistence by triggering a storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: serializedValue,
        storageArea: localStorage
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  /**
   * Get an item from localStorage with error handling
   */
  getItem: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Remove an item from localStorage
   */
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      
      // Trigger storage event for removal
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: null,
        storageArea: localStorage
      }));
      
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};
