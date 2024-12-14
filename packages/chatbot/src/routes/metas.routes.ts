import { Hono } from "hono";
import { getEnv } from "../env";
import { html } from "hono/html";
import { MessageHandler } from "../MessageHandler";
import { MetaPlatform } from "../platforms";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

const metaEnvSchema = z.object({
  META_PAGE_ACCESS_TOKEN: z.string(),
  META_PAGE_ID: z.string(),
  META_APP_ID: z.string(),
  META_APP_SECRET: z.string(),
});

const initMessageHandler = createMiddleware<{
  Variables: {
    messageHandler: MessageHandler;
  };
}>(async (c, next) => {
  let { success, data: env, error } = metaEnvSchema.safeParse(c.env);
  if (!success || !env) {
    console.error(error);
    throw new Error("Invalid environment variables");
  }

  const metaPlatform = new MetaPlatform(
    env.META_PAGE_ACCESS_TOKEN,
    env.META_PAGE_ID,
    env.META_APP_ID,
    env.META_APP_SECRET,
  );

  const messageHandler = new MessageHandler(metaPlatform);

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
