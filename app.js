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
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome to Cqolin! Manage your links easily.");
  bot.sendMessage(
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
      "Access the app at: https://cqolin-bot.onrender.com"
    );
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on https://cqolin-bot.onrender.com:${PORT}`);
});
