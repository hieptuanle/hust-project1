import type { PlatformId } from "../platforms/Platform";

export interface PlatformSessionStorage<ID = string> {
  getActiveSession(platformUser: ID): Promise<PlatformSession<ID> | null>;
  createSession(
    session: Omit<
      PlatformSession<ID>,
      "id" | "lastInteraction" | "createdAt" | "updatedAt"
    >,
  ): Promise<PlatformSession<ID>>;
  updateSession(session: PlatformSession<ID>): Promise<PlatformSession<ID>>;
}

export interface PlatformSession<ID = string> {
  id: ID;
  platformUser: ID;
  platform: PlatformId;
  status: "ACTIVE" | "DONE" | "ABANDONED";
  context?: {
    occasion?: string;
    color?: string;
    size?: string;
    style?: string;
    address?: string;
    phone?: string;
    orderCustomerName?: string;
    orderCustomerPhone?: string;
    receiverCustomerName?: string;
    receiverCustomerPhone?: string;
    receiverCustomerAddress?: string;
    receiveDate?: string;
    receiveTime?: string;
    orderItems?: {
      sku: string;
      description: string;
      quantity: number;
      soldPrice: number;
      imageUrl: string;
    }[];
  };
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}
