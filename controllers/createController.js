const firebaseController = require("./firebaseController");

// Render Create Page
exports.renderCreatePage = (req, res) => {
  res.render("create");
};

// Create a link (Save locally or to cloud)
exports.createLink = (req, res) => {
  const { name, link, category, saveOption } = req.body;

  if (saveOption === "cloud") {
    firebaseController.saveToCloud(req, res, { name, link, category });
  } else {
    // Save locally to user's localStorage (handled on client-side)
    res.redirect("/home");
  }
};

// Import from Cloud
exports.importFromCloud = (req, res) => {
  const { username } = req.body;
  firebaseController.importFromCloud(username).then((data) => {
    if (data) {
      res.redirect("/home");
    } else {
      res.render("create", { message: "No data found in cloud." });
    }
  });
};
