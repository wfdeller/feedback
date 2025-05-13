import axios from 'axios';

// Default fallback URL if environment variable is not set
const WEBTELE_SERVICE_URL = process.env.WEBTELE_SERVICE_URL || 'https://api.example.com/webtele';

/**
 * Fetches user information from WebTeleService
 * @param {string} userId - The user ID to look up
 * @returns {Promise<Object>} - User information object
 */
const fetchUserInfo = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log(`Fetching user info for: ${userId}`);
    
    // Make request to WebTeleService
    const response = await axios.get(`${WEBTELE_SERVICE_URL}/${userId}`);
    
    // Extract the desired fields from the response
    const { FormattedName, OfficialEmail } = response.data;
    
    // Return processed user information
    return {
      userId,
      userName: FormattedName || `User ${userId}`,
      email: OfficialEmail || '',
      rawData: response.data // Keep the raw data for reference if needed
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    
    // Return a default object with the userId and a placeholder username
    return {
      userId,
      userName: `User ${userId}`,
      email: '',
      error: error.message,
    };
  }
};

/**
 * Cached version of fetchUserInfo to avoid repeated API calls for the same userId
 */
const userCache = new Map();

const getUserInfo = async (userId) => {
  // If we have this user cached, return from cache
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  
  // Otherwise fetch from API
  const userInfo = await fetchUserInfo(userId);
  
  // Cache the result (with 10 minute expiry)
  userCache.set(userId, userInfo);
  
  // Set up cache expiry after 10 minutes
  setTimeout(() => {
    userCache.delete(userId);
  }, 10 * 60 * 1000);
  
  return userInfo;
};

export { getUserInfo };