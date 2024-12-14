import { Platform, PlatformMessage } from "./platforms";

export class MessageHandler {
  constructor(private platform: Platform) {}

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

    // Here you can process the message and generate a response
    const response = `Received: ${message.message}`;

    // Send response back
    try {
      await platform.sendMessage({
        receiver: message.sender,
        message: response,
      });
    } catch (error) {
      console.error(`Failed to send message to ${message.sender}:`, error);
    }
  }

  async getMessages() {
    return this.platform.getMessages();
  }
}
