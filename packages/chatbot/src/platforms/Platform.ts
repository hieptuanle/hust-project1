export interface Platform {
  id: PlatformId;
  name: string;
  extractMessage: (body: any) => Promise<PlatformMessage>;
  sendMessage: (message: OutgoingMessage) => Promise<void>;
  registerWebhook?: () => Promise<void>;
  getWebhookInfo?: () => Promise<any>;
  requestLongLivedAccessToken?: () => Promise<string>;
  getMessages: () => Promise<PlatformMessage[]>;
}

export interface PlatformMessage {
  sender: string;
  role: "user" | "assistant";
  timestamp: number;
  message: string;
  platform: PlatformId;
}

export interface OutgoingMessage {
  receiver: string;
  message: string;
}

export type PlatformId = "meta" | "telegram";
