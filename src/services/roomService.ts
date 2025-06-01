
const API_BASE_URL = "https://modsi-api-ffhhfgecfdehhscv.spaincentral-01.azurewebsites.net/api";
const API_CODE = "z4tKbNFdaaXzHZ4ayn9pRQokNWYgRkbVkCjOxTxP-8ChAzFuMigGCw==";

// Generate a random alphanumeric room code (5 characters as per API requirement)
export const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) { // API requires exactly 5 characters
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Create a new room with configuration data
export const createRoom = async (configurationData: any): Promise<string> => {
  try {
    const roomCode = generateRoomCode();
    
    console.log("Creating room with code:", roomCode);
    console.log("Configuration data:", configurationData);
    
    const response = await fetch(
      `${API_BASE_URL}/Room/Add?code=${API_CODE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Id: roomCode,
          JsonData: JSON.stringify(configurationData)
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`Error creating room: ${response.statusText} - ${errorText}`);
    }

    // Verify response was successful
    const responseData = await response.text();
    console.log("Room creation response:", responseData);
    
    // Check if response indicates success
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    console.log("Room created successfully with code:", roomCode);
    return roomCode;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

// Get room data by room code
export const getRoomData = async (roomCode: string): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Room/Get/${roomCode}?code=${API_CODE}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error getting room data: ${response.statusText}`);
    }

    const roomData = await response.json();
    
    // Parse JsonData if it's a string
    if (typeof roomData.JsonData === 'string') {
      roomData.JsonData = JSON.parse(roomData.JsonData);
    }

    return roomData;
  } catch (error) {
    console.error("Error getting room data:", error);
    throw error;
  }
};
