export interface PlatformUserStorage {
  getUserFromExternalId(externalId: string): Promise<PlatformUser | null>;
  createUser(
    user: Omit<
      PlatformUser,
      "id" | "lastInteraction" | "createdAt" | "updatedAt"
    >,
  ): Promise<PlatformUser>;
  updateUserLastInteraction(id: string, lastInteraction: Date): Promise<void>;
}

export interface PlatformUser {
  id: string;
  externalId: string;
  name?: string;
  phone?: string;
  platform: string;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}
