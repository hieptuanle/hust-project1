import { Hono } from "hono";
import { MessageHandler } from "../MessageHandler";

import { createMiddleware } from "hono/factory";
import { zaloPlatform } from "../platforms";
import type { Queue } from "../queue/Queue";
import type { JobData } from "../jobs/types/JobData";

const initMessageHandler = createMiddleware<{
  Variables: {
    messageHandler: MessageHandler;
    queue: Queue<JobData>;
  };
}>(async (c, next) => {
  const messageHandler = new MessageHandler(zaloPlatform, c.get("queue"));

  c.set("messageHandler", messageHandler);
  await next();
});

const app = new Hono<{
  Variables: {
    messageHandler: MessageHandler;
    queue: Queue<JobData>;
  };
}>()
  .use(initMessageHandler)
  .get("/", (c) => {
    return c.html(<div>Hello World </div>);
  })
  .get("/callback", async (c) => {
    return c.text("OK");
  })
  .post("/callback", async (c) => {
    const body = await c.req.json();
    await c.var.messageHandler.handleIncomingMessage(body);
    return c.text("OK");
  })
  .get("/messages", async (c) => {
    const messages = await c.var.messageHandler.getMessages();
    return c.json(messages);
  })
  // .get("/refresh-access-token", async (c) => {
  //   const { accessToken, refreshToken, expiresIn } = await zaloPlatform.refreshAccessToken();
  //   zaloPlatform.updateConfig({ accessToken, refreshToken });
  //   return c.json({ accessToken, refreshToken, expiresIn });
  // });

export default app;
