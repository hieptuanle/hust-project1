import type { JobData } from "./JobHandler";
import type { Platform, PlatformMessage } from "./platforms";
import type { Queue } from "./queue/Queue";

export class MessageHandler {
  constructor(private platform: Platform, private queue: Queue<JobData>) { }

  // should not throw errors, just log them
  async handleIncomingMessage(body: any) {
    const platform = this.platform;

    let message: PlatformMessage;
    try {
      message = await platform.extractMessage(body);
      console.log(message);
    } catch (error) {
      console.error(
        `Failed to extract message from ${this.platform.id}:`,
        error,
      );
      return;
    }

    try {
      await this.queue.add({
        name: "PROCESS_MESSAGE",
        data: {
          type: "PROCESS_MESSAGE",
          payload: {
            message,
            platform: this.platform.id,
          },
        },
      });
    } catch (error) {
      console.error("Failed to send message to queue:", error);
    }
  }

  async getMessages() {
    return this.platform.getMessages();
  }

  async requestLongLivedAccessToken() {
    if (this.platform.requestLongLivedAccessToken) {
      return this.platform.requestLongLivedAccessToken();
    }
    return null;
  }

  async registerWebhook() {
    if (this.platform.registerWebhook) {
      await this.platform.registerWebhook();
    }
  }

  async getWebhookInfo() {
    if (this.platform.getWebhookInfo) {
      return this.platform.getWebhookInfo();
    }

    return null;
  }
}
