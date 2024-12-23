import type { PlatformMessage } from "../platforms";
import type { PlatformId } from "../platforms/Platform";

export interface SessionMessageStorage<ID = string> {
  saveMessage(
    message: Omit<SessionMessage<ID>, "id" | "createdAt" | "updatedAt">,
  ): Promise<SessionMessage<ID>>;
  saveMessages(
    messages: Omit<SessionMessage<ID>, "id" | "createdAt" | "updatedAt">[],
  ): Promise<SessionMessage<ID>[]>;
}

export interface SessionMessage<ID = string> {
  id: ID;
  platformUser: ID;
  platform: PlatformId;
  session: ID;
  platformMessage: PlatformMessage;
  createdAt: Date;
  updatedAt: Date;
}
