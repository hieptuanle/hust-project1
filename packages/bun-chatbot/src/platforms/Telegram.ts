import type { OutgoingMessage, Platform, PlatformMessage } from "./Platform";


// Telegram Types
type TelegramUpdate = {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      username?: string;
      type: string;
    };
    date: number;
    text: string;
  };
};

export class TelegramPlatform implements Platform {
  constructor(private botToken: string, private webhookUrl: string) { }

  id = "telegram" as const;
  name = "Telegram" as const;

  async registerWebhook(): Promise<void> {
    const url =
      `https://api.telegram.org/bot${this.botToken}/setWebhook?url=${this.webhookUrl}`;
    await fetch(url);
  }

  async getWebhookInfo(): Promise<JSON> {
    const url = `https://api.telegram.org/bot${this.botToken}/getWebhookInfo`;
    const response = await fetch(url);
    return response.json();
  }

  async extractMessage(body: unknown): Promise<PlatformMessage> {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const telegramBody = body as TelegramUpdate;
    return {
      sender: telegramBody.message.from.id.toString(),
      timestamp: telegramBody.message.date * 1000, // Convert to milliseconds
      message: telegramBody.message.text,
      platform: this.id,
      role: "user",
    };
  }

  async sendMessage(message: OutgoingMessage): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: message.receiver,
        text: message.message,
      }),
    });
  }


  // deno-lint-ignore require-await
  async getMessages(): Promise<PlatformMessage[]> {
    return []
  }
}
