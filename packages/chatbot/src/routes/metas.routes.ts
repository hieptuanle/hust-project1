import { Hono } from "hono";
import { html } from "hono/html";
import { getEnv } from "../env";
import { MessageHandler } from "../MessageHandler";

import { createMiddleware } from "hono/factory";
import { metaPlatform } from "../platforms";
import type { Queue } from "../queue/Queue";
import type { JobData } from "../jobs/types/JobData";

const initMessageHandler = createMiddleware<{
  Variables: {
    messageHandler: MessageHandler;
    queue: Queue<JobData>;
  };
}>(async (c, next) => {
  const messageHandler = new MessageHandler(
    metaPlatform,
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
  .get("/", (c) => {
    return c.text("Hello meta");
  })
  .get("/callback", (c) => {
    const challenge = c.req.query("hub.challenge");
    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const localToken = getEnv(c, "META_WEBHOOK_VERIFY_TOKEN");

    if (mode === "subscribe" && token === localToken) {
      return c.text(challenge || "");
    } else {
      return c.text("Forbidden", 403);
    }
  })
  .post("/callback", async (c) => {
    const body = await c.req.json();
    await c.var.messageHandler.handleIncomingMessage(body);
    return c.text("OK");
  })
  .get("/request-long-lived-access-token", async (c) => {
    const stringifiedJson = await c.var.messageHandler
      .requestLongLivedAccessToken();
    return c.html(html`
<!DOCTYPE html>
<html>

<head>
  <title>Long lived access token</title>
  <link rel="icon" href="/static/logo.png" />
  <link href="/dist/globals.css" rel="stylesheet" />
</head>

<body class="bg-gray-100 min-h-screen">
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-center">Long lived access token</h1>
    <pre>${stringifiedJson}</pre>
  </div>
</body>

</html>

  `);
  })
  .get("/messages", async (c) => {
    const messages = await c.var.messageHandler.getMessages();
    return c.json(messages);
  });

export default app;
