import { Hono } from "hono";
import { html } from "hono/html";
import { MessageHandler } from "../MessageHandler";

import { createMiddleware } from "hono/factory";
import type { Queue } from "../queue/Queue";
import { telegramPlatform } from "../platforms";
import type { JobData } from "../JobHandler";

const initMessageHandler = createMiddleware<{
  Variables: {
    messageHandler: MessageHandler;
    queue: Queue<JobData>;
  };
}>(async (c, next) => {
  const messageHandler = new MessageHandler(
    telegramPlatform,
    c.get("queue"),
  );

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
  <link rel="icon" href="/static/logo.png" />
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
