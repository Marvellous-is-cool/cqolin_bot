const firebaseController = require("./firebaseController");

exports.renderWelcomePage = (req, res) => {
  res.render("welcome");
};

// Render Home Page with Firebase and LocalStorage
exports.renderHomePage = (req, res) => {
  const username = req.session.username; // Access username from session

  if (!username) {
    // If no username in session, render with empty links and handle in client
    return res.render("home", { links: [], categories: [], username: null });
  }

  firebaseController
    .getLinksByUsername(username)
    .then((firebaseLinks) => {
      // If links found in Firebase, render them
      if (firebaseLinks && firebaseLinks.length > 0) {
        res.render("home", {
          links: firebaseLinks,
          categories: categories,
          username,
        });
      } else {
        // Render with empty links if none found in Firebase
        res.render("home", { links: [], categories: [], username });
      }
    })
    .catch((error) => {
      console.log("Error fetching links from Firebase: ", error);
      // In case of an error, render with empty links and handle in client
      res.render("home", { links: [], categories: [], username });
    });
};
