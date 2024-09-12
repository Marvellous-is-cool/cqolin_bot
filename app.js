const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const homeController = require("./controllers/homeController");
const createController = require("./controllers/createController");
const aboutController = require("./controllers/aboutController");
const updatesController = require("./controllers/updatesController");
const profileController = require("./controllers/profileController");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

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
const bot = new TelegramBot(token, { polling: true });

// Handle Telegram '/start' command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Initial message for the user
  bot.sendMessage(chatId, "Welcome to Cqolin! Manage your links easily.");

  // Message with the 'Open' button to access the mini app
  bot.sendMessage(chatId, "Click the button below to open the app.", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open", // The button label
            url: "https://cqolin-bot.onrender.com", // The URL to your hosted mini app (replace with your actual URL)
          },
        ],
      ],
    },
  });
});

// Handle Telegram button click
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === "start_app") {
    // Here you can provide any additional logic if needed when the button is clicked
    bot.sendMessage(chatId, "Opening the app...");

    // Optionally send a direct message with the app link (if you want to do so)
    bot.sendMessage(
      chatId,
      "Access the app at: https://cqolin-bot.onrender.com"
    );
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on https://cqolin-bot.onrender.com:${PORT}`);
});
