const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const homeController = require("./controllers/homeController");
const createController = require("./controllers/createController");
const aboutController = require("./controllers/aboutController");
const updatesController = require("./controllers/updatesController");
const profileController = require("./controllers/profileController");
const {
  checkUserExistsByUsername,
} = require("./controllers/firebaseController");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Session setup
app.use(
  session({
    secret: "catizen",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Set to true if using HTTPS
  })
);

// Routes
app.get("/", homeController.renderWelcomePage);
app.get("/home", homeController.renderHomePage);
app.get("/create", createController.renderCreatePage);
app.post("/create", createController.createLink);
app.get("/about", aboutController.renderAboutPage);
app.get("/updates", updatesController.renderUpdatesPage);
app.get("/profile", profileController.renderProfilePage);

// Firebase Routes
app.post("/importFromCloud", createController.importFromCloud);

// Telegram Bot Setup
const token = process.env.TELEGRAM_BOT_TOKEN; // Store your bot token in .env file
const bot = new TelegramBot(token);

// Set up webhook URL (make sure your app is hosted somewhere with HTTPS, e.g., Render or Heroku)
const webhookUrl = `${process.env.WEBHOOK_URL}/bot${token}`;

// Set webhook for your bot
bot.setWebHook(webhookUrl);

// Webhook endpoint for Telegram updates
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Handle Telegram '/start' command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username; // Retrieve the Telegram username

  try {
    // Store the username in session
    req.session.username = username;

    // Check if user data exists by username without authentication
    const userDoc = await checkUserExistsByUsername(username);

    if (userDoc) {
      // User exists, proceed normally
      await bot.sendMessage(
        chatId,
        "Welcome back to Cqolin! Your data has been loaded."
      );
    } else {
      // User does not exist, inform them of the next steps
      await bot.sendMessage(
        chatId,
        "Welcome to Cqolin! You can start managing your links."
      );
    }

    await bot.sendMessage(
      chatId,
      "Click the button below to start managing your links.",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Start Managing Links", callback_data: "start_app" }],
          ],
        },
      }
    );
  } catch (error) {
    await bot.sendMessage(
      chatId,
      "There was an error loading your data. Please try again later."
    );
  }
});

// Handle Telegram button click
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === "start_app") {
    bot.sendMessage(chatId, "Opening the app...");

    // Provide the URL of your hosted app (on Render, for example)
    bot.sendMessage(
      chatId,
      "Access the app at: https://t.me/cqolin_bot/cqolin"
    );
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on https://t.me/cqolin_bot/cqolin:${PORT}`);
});
