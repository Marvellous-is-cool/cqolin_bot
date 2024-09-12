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

exports.renderProfilePage = async (req, res) => {
  const userId = req.query.userId; // Get userId from query parameter

  // Fetch Telegram profile picture
  const profilePic = await getTelegramUserProfile(userId);

  // Fetch user profile statistics from Firebase or local storage
  firebaseController
    .getUserProfile(userId)
    .then((profileData) => {
      if (profileData) {
        res.render("profile", {
          username: profileData.username,
          profilePic: profilePic,
          totalLinks: profileData.totalLinks || 0,
          totalCategories: profileData.totalCategories || 0,
        });
      } else {
        res.render("profile", {
          username: profileData.username || "Unknown",
          profilePic: profilePic,
          totalLinks: 0,
          totalCategories: 0,
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching profile data from Firebase: ", error);
      res.render("profile", {
        username: "Unknown",
        profilePic: profilePic,
        totalLinks: 0,
        totalCategories: 0,
      });
    });
};
