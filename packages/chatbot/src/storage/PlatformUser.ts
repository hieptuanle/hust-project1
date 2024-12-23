import type { PlatformId } from "../platforms/Platform";

export interface PlatformUserStorage<ID = string> {
  getUser(id: ID): Promise<PlatformUser<ID> | null>;
  getUsers(): Promise<PlatformUser<ID>[]>;
  getUserFromExternalId(externalId: string): Promise<PlatformUser<ID> | null>;
  createUser(
    user: Omit<
      PlatformUser,
      "id" | "lastInteraction" | "createdAt" | "updatedAt"
    >,
  ): Promise<PlatformUser<ID>>;
  updateUserLastInteraction(id: ID, lastInteraction: Date): Promise<void>;
}

export interface PlatformUser<ID = string> {
  id: ID;
  externalId: string;
  name?: string;
  phone?: string;
  platform: PlatformId;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}
