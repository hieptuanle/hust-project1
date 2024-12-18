import { PlatformMessage } from "../platforms";

export interface SessionMessageStorage {
  saveMessage(
    message: Omit<SessionMessage, "id" | "createdAt" | "updatedAt">,
  ): Promise<SessionMessage>;
  saveMessages(
    messages: Omit<SessionMessage, "id" | "createdAt" | "updatedAt">[],
  ): Promise<SessionMessage[]>;
}

export interface SessionMessage {
  id: string;
  platformUserId: string;
  platformId: string;
  sessionId: string;
  platformMessage: PlatformMessage;
  createdAt: Date;
  updatedAt: Date;
}
