import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import metasRoutes from "./routes/metas.routes";
import telegramRoutes from "./routes/telegram.routes";
import { logger } from "hono/logger";
import { mongoStorage } from "./storage";
import { createMiddleware } from "hono/factory";
import customersRoutes from "./routes/customers.routes";
import mongoScheduler from "./scheduler";
import { bullQueue } from "./queue";

const app = new Hono();

const initStorage = createMiddleware(async (c, next) => {
  c.set("storage", mongoStorage);
  await next();
});

const initQueue = createMiddleware(async (c, next) => {
  c.set("queue", bullQueue);
  await next();
});

const initScheduler = createMiddleware(async (c, next) => {
  c.set("scheduler", mongoScheduler);
  await next();
});

app.use(logger());
app.use(initStorage);
app.use(initQueue);
app.use(initScheduler);
app.use(async (c, next) => {
  await next();
  if (c.error) {
    console.error(c.error);
    return c.json({ error: c.error.message }, 500);
  }
});

app.use("/dist/*", serveStatic({ root: "./public" }));
app.use("/data-deletion/*", serveStatic({ root: "./public" }));
app.use("/favicon.ico", serveStatic({ root: "./public" }));
app.use("/privacy/*", serveStatic({ root: "./public" }));
app.use("/tos/*", serveStatic({ root: "./public" }));
app.use("/static/*", serveStatic({ root: "./public" }));

app.get(
  "/",
  serveStatic({
    root: "./public",
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`);
    },
  }),
);

// Meta routes
app.route("/api/v1/platforms/meta", metasRoutes);

// Telegram routes
app.route("/api/v1/platforms/telegram", telegramRoutes);

app.route("/customers", customersRoutes);

await mongoStorage.connect();

mongoScheduler.start();

export default {
  fetch: app.fetch,
  port: 8787,
  // queue,
};
