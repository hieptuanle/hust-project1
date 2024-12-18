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
  constructor(private botToken: string, private webhookUrl: string) {}

  id = "telegram" as const;
  name = "Telegram" as const;

  async registerWebhook(): Promise<void> {
    const url =
      `https://api.telegram.org/bot${this.botToken}/setWebhook?url=${this.webhookUrl}`;
    await fetch(url);
  }

  async getWebhookInfo(): Promise<any> {
    const url = `https://api.telegram.org/bot${this.botToken}/getWebhookInfo`;
    const response = await fetch(url);
    return response.json();
  }

  async extractMessage(body: TelegramUpdate): Promise<PlatformMessage> {
    console.log(JSON.stringify(body, null, 2));
    return {
      sender: body.message.from.id.toString(),
      timestamp: body.message.date * 1000, // Convert to milliseconds
      message: body.message.text,
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

  async getMessages(): Promise<PlatformMessage[]> {
    const url =
      `https://api.telegram.org/bot${this.botToken}/getUpdates?allowed_updates=message`;
    const response = await fetch(url);
    const data = (await response.json()) as any;

    if (!data.ok || !Array.isArray(data.result)) {
      throw new Error(
        "Failed to fetch messages. Error: " + JSON.stringify(data),
      );
    }

    return data.result
      .filter((update: TelegramUpdate) => update.message && update.message.text)
      .map((update: TelegramUpdate) => ({
        sender: update.message.from.id.toString(),
        timestamp: update.message.date * 1000, // Convert to milliseconds
        message: update.message.text,
        platform: this.id,
        role: "user",
      }));
  }
}
