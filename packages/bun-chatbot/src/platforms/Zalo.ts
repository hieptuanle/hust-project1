import type { OutgoingMessage, Platform, PlatformMessage } from "./Platform";


// Zalo Types

type ZaloMessageWebhookPayload = {
  app_id: string;
  sender: {
    id: string;
  };
  user_id_by_app: string;
  recipient: {
    id: string;
  };
  event_name: string;
  message: {
    text: string;
    msg_id: string;
  };
  timestamp: string;
};

type ZaloRecentMessagesResponse = {
  data: {
    src: number;
    time: number;
    sent_time: string;
    from_id: string;
    from_display_name: string;
    from_avatar: string;
    to_id: string;
    to_display_name: string;
    to_avatar: string;
    message_id: string;
    type: string;
    message: string;
  }[];
};


export class ZaloPlatform implements Platform {
  id = "zalo" as const;
  name = "Zalo" as const;

  constructor(
    private accessToken: string,
  ) { }

  async extractMessage(body: unknown): Promise<PlatformMessage> {
    const message = body as ZaloMessageWebhookPayload;
    return {
      sender: message.sender.id,
      role: "user",
      timestamp: parseInt(message.timestamp),
      message: message.message.text,
      platform: this.id,
    };
  }

  async sendMessage(message: OutgoingMessage): Promise<void> {
    const url =
      `https://openapi.zalo.me/v3.0/oa/message/cs`;

    const payload = {
      "recipient": {
        "user_id": message.receiver
      },
      "message": {
        "text": message.message
      }
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": this.accessToken
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

  async getMessages(): Promise<PlatformMessage[]> {
    const url = `https://openapi.zalo.me/v2.0/oa/listrecentchat`
    const searchParams = new URLSearchParams({
      "data": JSON.stringify({ "offset": 0, "count": 5 })
    })


    const response = await fetch(`${url}?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access_token": this.accessToken
      }
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        `Failed to get messages from: ${JSON.stringify(
          errorBody,
        )
        }`,
      );
    }

    const data = await response.json() as ZaloRecentMessagesResponse;
    return data.data.map((message) => ({
      sender: message.from_id,
      role: "user",
      timestamp: message.time,
      message: message.message,
      platform: this.id,
    }));
  }
}
