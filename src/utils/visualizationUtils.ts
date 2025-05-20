
/**
 * Saves a visualization room code to local storage history
 */
export const saveVisualizationToHistory = (code: string) => {
  try {
    // Get existing history or initialize empty array
    const historyStr = localStorage.getItem("visualizationHistory");
    const history = historyStr ? JSON.parse(historyStr) : [];
    
    // Add new code if not already in history
    if (!history.includes(code)) {
      const newHistory = [code, ...history].slice(0, 10); // Keep only last 10
      localStorage.setItem("visualizationHistory", JSON.stringify(newHistory));
    }
  } catch (error) {
    console.error("Error saving visualization to history:", error);
  }
};

/**
 * Generates a random room code for VR visualization
 */
export const generateRoomCode = () => {
  // Generate a random alphanumeric code (would be replaced by API call in production)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Gets the visualization history from local storage
 */
export const getVisualizationHistory = () => {
  try {
    const historyStr = localStorage.getItem("visualizationHistory");
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error("Error getting visualization history:", error);
    return [];
  }
};
