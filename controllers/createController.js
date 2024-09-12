const firebaseController = require("./firebaseController");

// Render Create Page
exports.renderCreatePage = (req, res) => {
  res.render("create");
};

// Create a link (Save locally or to cloud)
exports.createLink = async (req, res) => {
  const { name, link, category, saveOption } = req.body;
  const username = req.session.username; // Assume username is passed or available from session

  if (saveOption === "cloud") {
    try {
      const userDoc = await firebaseController.checkUserExistsByUsername(
        username
      );

      if (userDoc) {
        // User exists, save link under their data
        await firebaseController.saveLinkToCloud(userDoc.uid, {
          name,
          link,
          category,
        });
      } else {
        // User does not exist, save new user with this link
        await firebaseController.saveNewUserToCloud(username, {
          name,
          link,
          category,
        });
      }

      res.redirect("/home");
    } catch (error) {
      console.error("Error saving link to cloud: ", error);
      res.render("create", { message: "Error saving link to cloud" });
    }
  } else {
    // If save option is "local", pass the data to the client-side script
    res.render("create", {
      name,
      link,
      category,
      saveLocally: true, // Flag to indicate local storage should be used
      username, // Pass username as well
    });
  }
};

// Import from Cloud
exports.importFromCloud = (req, res) => {
  const { username } = req.body;
  firebaseController
    .importFromCloud(username)
    .then((data) => {
      if (data) {
        res.redirect("/home");
      } else {
        res.render("create", { message: "No data found in cloud." });
      }
    })
    .catch((error) => {
      res.render("create", {
        message: "Error importing from cloud: " + error.message,
      });
    });
};
