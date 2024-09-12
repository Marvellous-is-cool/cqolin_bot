const firebaseController = require("./firebaseController");

exports.renderWelcomePage = (req, res) => {
  res.render("welcome");
};

// Render Home Page with Links
exports.renderHomePage = (req, res) => {
  const username = req.session.username; // Access username from session

  if (!username) {
    return res.render("home", { links: [] }); // Handle missing username gracefully
  }

  firebaseController
    .getLinksByUsername(username)
    .then((links) => {
      if (links) {
        res.render("home", { links });
      } else {
        res.render("home", { links: [] });
      }
    })
    .catch((error) => {
      console.log("Error fetching links: ", error);
      res.render("home", { links: [] });
    });
};
