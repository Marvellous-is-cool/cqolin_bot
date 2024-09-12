exports.getWelcomePage = (req, res) => {
  // Check if the user is a first-time visitor using cookies for server-side validation
  const firstTime = req.cookies.firstTime || "true"; // Default to "true" if cookie not found

  if (firstTime === "false") {
    // If not a first-time visitor, redirect to the home page
    return res.redirect("/home");
  }

  // Render the welcome page for first-time visitors
  res.render("welcome", {
    title: "Welcome to Cqolin",
  });
};

// Optional: a route for skipping the welcome page, which can be triggered after visiting once.
exports.skipWelcome = (req, res) => {
  // Set a cookie to mark that the user has already visited the welcome page
  res.cookie("firstTime", "false", { maxAge: 900000, httpOnly: true }); // 15-minute expiration
  res.redirect("/home");
};
