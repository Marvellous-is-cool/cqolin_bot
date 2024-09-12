const firebaseController = require("./firebaseController");

// Render Home Page with Firebase and LocalStorage
exports.renderHomePage = (req, res) => {
  const username = req.session.username; // Access username from session

  if (!username) {
    // If no username in session, render with empty links and handle in client
    return res.render("home", { links: [], username: null });
  }

  firebaseController
    .getLinksByUsername(username)
    .then((firebaseLinks) => {
      // If links found in Firebase, render them
      if (firebaseLinks && firebaseLinks.length > 0) {
        res.render("home", { links: firebaseLinks, username });
      } else {
        // Render with empty links if none found in Firebase
        res.render("home", { links: [], username });
      }
    })
    .catch((error) => {
      console.log("Error fetching links from Firebase: ", error);
      // In case of an error, render with empty links and handle in client
      res.render("home", { links: [], username });
    });
};
