const axios = require("axios");
const firebaseController = require("./firebaseController");

// Telegram Bot Token (should be stored in environment variables for security)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;

// Fetch user profile from Telegram
async function getTelegramUserProfile(userId) {
  try {
    const response = await axios.get(
      `${TELEGRAM_API_URL}getUserProfilePhotos`,
      {
        params: { user_id: userId },
      }
    );
    if (
      response.data &&
      response.data.result &&
      response.data.result.photos.length > 0
    ) {
      const photoFileId = response.data.result.photos[0][0].file_id;
      const photoUrlResponse = await axios.get(`${TELEGRAM_API_URL}getFile`, {
        params: { file_id: photoFileId },
      });
      const filePath = photoUrlResponse.data.result.file_path;
      return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
    }
    return "/path/to/default-profile-pic.png"; // Default profile picture
  } catch (error) {
    console.error("Error fetching user profile from Telegram: ", error);
    return "/path/to/default-profile-pic.png"; // Default profile picture
  }
}

// Function to sum details from Firebase and local storage
async function getUserDetails(username) {
  let totalLinks = 0;
  let totalCategories = 0;

  try {
    // Fetch user details from Firebase
    const firebaseProfile = await firebaseController.checkUserExistsByUsername(
      username
    );
    if (firebaseProfile) {
      totalLinks += firebaseProfile.totalLinks || 0;
      totalCategories += firebaseProfile.totalCategories || 0;
    }
  } catch (error) {
    console.error("Error fetching profile data from Firebase: ", error);
  }

  try {
    // Fetch user details from local storage
    const localStorageData = getLocalStorageData(username);
    if (localStorageData) {
      totalLinks += localStorageData.totalLinks || 0;
      totalCategories += localStorageData.totalCategories || 0;
    }
  } catch (error) {
    console.error("Error fetching profile data from Local Storage: ", error);
  }

  return { totalLinks, totalCategories };
}

// Placeholder function for fetching local storage data
// This function needs to be implemented according to how your local storage is set up
function getLocalStorageData(username) {
  // Example structure of local storage data retrieval
  // Adjust as per the actual implementation of local storage in your application
  try {
    // Fetching from a presumed local storage API or direct access if running client-side code
    const localData = localStorage.getItem(`user_${username}`);
    return localData ? JSON.parse(localData) : null;
  } catch (error) {
    console.error("Error accessing local storage: ", error);
    return null;
  }
}

exports.renderProfilePage = async (req, res) => {
  const userId = req.query.userId; // Get userId from query parameter

  // Fetch Telegram profile picture
  const profilePic = await getTelegramUserProfile(userId);

  // Fetch username from session
  const username = req.session.username || "Unknown";

  // Fetch user details (total links and categories) from Firebase and local storage
  const { totalLinks, totalCategories } = await getUserDetails(username);

  // Render the profile page with the collected data
  res.render("profile", {
    username: username,
    profilePic: profilePic,
    totalLinks: totalLinks,
    totalCategories: totalCategories,
  });
};
