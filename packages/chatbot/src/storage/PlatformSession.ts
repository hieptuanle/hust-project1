export interface PlatformSessionStorage {
  getActiveSession(platformUserId: string): Promise<PlatformSession | null>;
  createSession(
    session: Omit<
      PlatformSession,
      "id" | "lastInteraction" | "createdAt" | "updatedAt"
    >,
  ): Promise<PlatformSession>;
  updateSession(session: PlatformSession): Promise<PlatformSession>;
}

export interface PlatformSession {
  id: string;
  platformUserId: string;
  platformId: string;
  status: "ACTIVE" | "DONE" | "ABANDONED";
  facts?: {
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
  };
  orderItems?: {
    sku: string;
    description: string;
    quantity: number;
    soldPrice: number;
    imageUrl: string;
  }[];
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}
