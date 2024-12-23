import type { PlatformId } from "../platforms/Platform";

export interface PlatformConfigStorage<ID = string> {
  getConfig(platformId: PlatformId): Promise<PlatformConfig<ID> | null>;
  createConfig(config: Omit<PlatformConfig<ID>, "id" | "createdAt" | "updatedAt">): Promise<void>;
  updateConfig(config: PlatformConfig<ID>): Promise<void>;
}

export interface PlatformConfig<ID = string> {
  id: ID;
  platformId: PlatformId;
  webhookVerifyToken?: string;
  webhookAccessToken?: string;
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  createdAt: Date;
  updatedAt: Date;
}
