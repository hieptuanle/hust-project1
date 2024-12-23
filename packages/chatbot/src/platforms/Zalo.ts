import type { ObjectId } from "mongodb";
import type Storage from "../storage/Storage";
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
    private refreshToken: string,
    private appId: string,
    private appSecret: string,
    private storage: Storage<ObjectId>,
  ) { }

  async init() {
    const config = await this.storage.platformConfig.getConfig(this.id);
    if (config && config.accessToken && config.refreshToken) {
      this.setAccessToken(config.accessToken)
      this.setRefreshToken(config.refreshToken)
    } else {
      await this.storage.platformConfig.createConfig({
        platformId: this.id,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      });
    }
  }

  async updateConfig({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const config = await this.storage.platformConfig.getConfig(this.id);
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    if (!config) {
      throw new Error('Zalo config not found');
    }
    config.accessToken = accessToken;
    config.refreshToken = refreshToken;
    await this.storage.platformConfig.updateConfig(config);
  }

  async getAccessToken() {
    const config = await this.getConfig();
    return config?.accessToken ?? this.accessToken;
  }

  async getRefreshToken() {
    const config = await this.getConfig();
    return config?.refreshToken ?? this.refreshToken;
  }

  async getConfig() {
    const config = await this.storage.platformConfig.getConfig(this.id);
    return config;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

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
          "access_token": await this.getAccessToken()
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
        "access_token": await this.getAccessToken()
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

  async refreshAccessToken(refreshToken?: string) {
    const url = 'https://oauth.zaloapp.com/v4/oa/access_token';
    const secretKey = this.appSecret;
    const appId = this.appId;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': secretKey
        },
        body: new URLSearchParams({
          refresh_token: refreshToken ?? await this.getRefreshToken(),
          app_id: appId,
          grant_type: 'refresh_token'
        }).toString()
      });

      if (!response.ok) {
        throw new Error(`Error refreshing access token: ${response.statusText}`);
      }

      const data = await response.json() as {
        access_token: string;
        refresh_token: string;
        expires_in: string;
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: parseInt(data.expires_in)
      };
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw error;
    }
  }
}
