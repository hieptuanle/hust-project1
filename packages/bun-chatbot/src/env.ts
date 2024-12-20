import process from "node:process";
import type { Context } from "hono";
import { env } from "hono/adapter";
import { z } from "zod";

type Bindings = {
  META_WEBHOOK_VERIFY_TOKEN: string;
  META_WEBHOOK_ACCESS_TOKEN: string;
  META_PAGE_ACCESS_TOKEN: string;
  META_PAGE_ID: string;
  META_APP_ID: string;
  META_APP_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_URL: string;
  QUEUE_NAME: string;
  MONGO_URI: string;
  MONGO_DB_NAME: string;
  ZALO_ACCESS_TOKEN: string;
};

export const getEnv = (c: Context, key: keyof Bindings) => {
  return env<Bindings>(c)[key];
};

const envSchema = z.object({
  META_WEBHOOK_VERIFY_TOKEN: z.string(),
  META_WEBHOOK_ACCESS_TOKEN: z.string(),
  META_PAGE_ACCESS_TOKEN: z.string(),
  META_PAGE_ID: z.string(),
  META_APP_ID: z.string(),
  META_APP_SECRET: z.string(),
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_WEBHOOK_URL: z.string(),
  QUEUE_NAME: z.string(),
  MONGO_URI: z.string(),
  MONGO_DB_NAME: z.string(),
  ZALO_ACCESS_TOKEN: z.string(),
});

export const processEnv = envSchema.parse(process.env);
