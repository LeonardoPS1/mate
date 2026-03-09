import { Context, NextFunction } from 'grammy';
import { config } from '../config.js';

export async function whitelistMiddleware(ctx: Context, next: NextFunction) {
  // If no allowed users are set, we might reject everything or allow everything.
  // Secure default: reject everyone if list is empty.
  if (config.telegram.allowedUserIds.length === 0) {
    console.warn(`[Security] Rejected user \${ctx.from?.id} because whitelist is empty.`);
    return;
  }

  const userId = ctx.from?.id;
  
  if (!userId || !config.telegram.allowedUserIds.includes(userId)) {
    console.log(`[Security] Unauthorized access attempt from user ID: \${userId}`);
    // Optional: ctx.reply("Sorry, you are not authorized to use this bot.");
    return; // Stop processing
  }

  // Proceed to next middleware or handler
  await next();
}
