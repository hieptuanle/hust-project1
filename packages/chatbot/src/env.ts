import { Context } from "hono";
import { env } from "hono/adapter";
import { PlatformMessage } from "./platforms/Platform";

type Bindings = {
  META_WEBHOOK_VERIFY_TOKEN: string;
  META_WEBHOOK_ACCESS_TOKEN: string;
  META_PAGE_ACCESS_TOKEN: string;
  META_PAGE_ID: string;
  META_APP_ID: string;
  META_APP_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_URL: string;
};

export const getEnv = (c: Context, key: keyof Bindings) => {
  return env<Bindings>(c)[key];
};

export const getQueue = (c: Context) => {
  return env<{
    PLATFORM_MESSAGES: Queue<PlatformMessage>;
  }>(c).PLATFORM_MESSAGES;
};
