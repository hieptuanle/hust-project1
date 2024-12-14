import { Hono } from "hono";

import metasRoutes from "./routes/metas.routes";
import telegramRoutes from "./routes/telegram.routes";

const app = new Hono();

app.use(async (c, next) => {
  await next();
  if (c.error) {
    console.error(c.error);
    return c.json({ error: c.error.message }, 500);
  }
});

// Meta routes
app.route("/api/v1/platforms/meta", metasRoutes);

// Telegram routes
app.route("/api/v1/platforms/telegram", telegramRoutes);

export default app;
