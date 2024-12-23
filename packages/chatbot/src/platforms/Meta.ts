import type { OutgoingMessage, Platform, PlatformMessage } from "./Platform";

// Meta (Facebook) Types
type MetaMessage = {
  object: string;
  entry: {
    time: number;
    id: string;
    messaging: {
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message: { mid: string; text: string };
    }[];
  }[];
};

type MetaConversationMessage = {
  id: string;
  message: string;
  created_time: string;
  from: { id: string };
};

type MetaConversation = {
  participants: {
    data: {
      id: string;
      name: string;
      email: string;
    }[];
  };
  messages: {
    data: MetaConversationMessage[];
  };
};

export class MetaPlatform implements Platform {
  constructor(
    private accessToken: string,
    private pageId: string,
    private appId: string,
    private appSecret: string,
  ) { }

  id = "meta" as const;
  name = "Meta" as const;

  getRole(senderId: string): "user" | "assistant" {
    return senderId === this.pageId ? "assistant" : "user";
  }

  async extractMessage(body: unknown): Promise<PlatformMessage> {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const metaBody = body as MetaMessage;
    const messaging = metaBody.entry[0].messaging[0];
    return {
      sender: messaging.sender.id,
      timestamp: messaging.timestamp,
      message: messaging.message.text,
      platform: this.id,
      role: this.getRole(messaging.sender.id),
    };
  }

  async sendMessage(message: OutgoingMessage): Promise<void> {
    const url =
      `https://graph.facebook.com/v21.0/${this.pageId}/messages?access_token=${this.accessToken}`;

    // Build a JSON payload
    const payload = {
      recipient: { id: message.receiver },
      message: { text: message.message },
      messaging_type: "RESPONSE",
      format: "json",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          `Failed to send message to ${message.receiver}: ${JSON.stringify(
            errorBody,
          )
          }`,
        );
      }
    } catch (error) {
      console.error(`Failed to send message to ${message.receiver}:`, error);
    }
  }

  async requestLongLivedAccessToken(): Promise<string> {
    const url =
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${this.accessToken}`;

    const response = await fetch(url);
    const data = await response.json();
    return JSON.stringify(data, null, 2);
  }

  async getMessages(): Promise<PlatformMessage[]> {
    const url =
      `https://graph.facebook.com/v21.0/${this.pageId}/conversations?fields=participants,messages{id,message,created_time,from{id}}&access_token=${this.accessToken}`;
    const response = await fetch(url);
    const data = await response.json() as { data: MetaConversation[] };
    const messages = data.data.flatMap((conversation: MetaConversation) =>
      conversation.messages.data.map((
        message: MetaConversationMessage,
      ) => ({
        sender: message.from.id,
        timestamp: new Date(message.created_time).getTime(),
        message: message.message,
        platform: this.id,
        role: this.getRole(message.from.id),
      }))
    );
    return messages;
  }
}
