import { Bot } from 'grammy';
import { config } from './config.js';
import { whitelistMiddleware } from './bot/middleware.js';
import { setupHandlers } from './bot/handlers.js';

console.log("Starting Mate AI Agent...");

// 1. Initialize Bot
const bot = new Bot(config.telegram.botToken);

// 2. Setup Middleware
bot.use(whitelistMiddleware);

// 3. Register Handlers
setupHandlers(bot);

// 4. Start Bot (Long Polling)
bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @\${botInfo.username} is running securely!`);
  }
});

// Graceful shutdown
process.once('SIGINT', () => {
    console.log("Shutting down gracefully...");
    bot.stop();
});
process.once('SIGTERM', () => {
    console.log("Shutting down gracefully...");
    bot.stop();
});
