import { MetaPlatform } from "./Meta";
import { TelegramPlatform } from "./Telegram";
import { processEnv } from "../env";
import { ZaloPlatform } from "./Zalo";
export type { OutgoingMessage, Platform, PlatformMessage } from "./Platform";

export const telegramPlatform = new TelegramPlatform(
  processEnv.TELEGRAM_BOT_TOKEN,
  processEnv.TELEGRAM_WEBHOOK_URL,
);

export const metaPlatform = new MetaPlatform(
  processEnv.META_PAGE_ACCESS_TOKEN,
  processEnv.META_PAGE_ID,
  processEnv.META_APP_ID,
  processEnv.META_APP_SECRET,
);

export const zaloPlatform = new ZaloPlatform(
  processEnv.ZALO_ACCESS_TOKEN,
);

export const platforms = [telegramPlatform, metaPlatform, zaloPlatform];
