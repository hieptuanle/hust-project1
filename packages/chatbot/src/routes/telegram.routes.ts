import { Hono } from "hono";
import { html } from "hono/html";
import { MessageHandler } from "../MessageHandler";
import { TelegramPlatform } from "../platforms";
import { getEnv } from "../env";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

const initMessageHandler = createMiddleware<{
  Variables: {
    messageHandler: MessageHandler;
  };
}>(async (c, next) => {
  const telegramToken = getEnv(c, "TELEGRAM_BOT_TOKEN");
  const telegramWebhookUrl = getEnv(c, "TELEGRAM_WEBHOOK_URL");

  const telegramPlatform = new TelegramPlatform(
    telegramToken,
    telegramWebhookUrl,
  );
  const messageHandler = new MessageHandler(telegramPlatform);

  c.set("messageHandler", messageHandler);
  await next();
});

const app = new Hono<{
  Variables: {
    messageHandler: MessageHandler;
  };
}>()
  .use(initMessageHandler)
  .post("/callback", async (c) => {
    const body = await c.req.json();
    await c.var.messageHandler.handleIncomingMessage(body);
    return c.text("OK");
  })
  .get("/register", async (c) => {
    await c.var.messageHandler.registerWebhook();
    return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Telegram webhook registered</title>
        <link href="/dist/globals.css" rel="stylesheet" />
      </head>
      <body class="bg-gray-100 min-h-screen">
        <div class="container mx-auto p-4">
          <h1 class="text-2xl font-bold text-center">Telegram webhook registered</h1>
        </div>
      </body>
    </html>
  `);
  })
  .get("/webhook", async (c) => {
    const info = await c.var.messageHandler.getWebhookInfo();
    return c.json(info);
  });

export default app;
