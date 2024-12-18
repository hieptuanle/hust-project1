import { MetaPlatform } from "./Meta";
import { TelegramPlatform } from "./Telegram";
export type { OutgoingMessage, Platform, PlatformMessage } from "./Platform";

import { z } from "zod";

const metaEnvSchema = z.object({
  META_PAGE_ACCESS_TOKEN: z.string(),
  META_PAGE_ID: z.string(),
  META_APP_ID: z.string(),
  META_APP_SECRET: z.string(),
});

const telegramEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_WEBHOOK_URL: z.string(),
});

const envSchema = z.object({
  ...metaEnvSchema.shape,
  ...telegramEnvSchema.shape,
});

const env = envSchema.parse(process.env);

export const telegramPlatform = new TelegramPlatform(
  env.TELEGRAM_BOT_TOKEN,
  env.TELEGRAM_WEBHOOK_URL,
);

export const metaPlatform = new MetaPlatform(
  env.META_PAGE_ACCESS_TOKEN,
  env.META_PAGE_ID,
  env.META_APP_ID,
  env.META_APP_SECRET,
);

export const platforms = [telegramPlatform, metaPlatform];
