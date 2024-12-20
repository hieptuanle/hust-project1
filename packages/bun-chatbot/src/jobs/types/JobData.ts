import type { PlatformMessage } from "../../platforms";

import type { PlatformId } from "../../platforms/Platform";
import type { SessionMessage } from "../../storage/SessionMessage";

type ProductId = string;
type ProductOptionId = string;

export type JobData<ID = string> =
  | {
    type: "UNDERSTAND_CONTENT";
    payload: {
      messages: SessionMessage<ID>[];
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SESSION_DONE";
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "INTRO_WEBSITE";
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "INTRO_RANDOM_PRODUCTS";
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_PRODUCT_DETAILS";
    payload: {
      productId: ID;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "CUSTOMER_SELECT_PRODUCT";
    payload: {
      productId: ProductId;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "CUSTOMER_SELECT_PRODUCT_OPTION";
    payload: {
      productId: ProductId;
      optionId: ProductOptionId;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_PRODUCT_OPTIONS";
    payload: {
      productId: ProductId;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_SHIPPING_FORM";
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "CUSTOMER_FILL_SHIPPING_FORM";
    payload: {
      messages: SessionMessage<ID>[];
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_PAYMENT_FORM";
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "GREETING";
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "RESPOND";
    payload: {
      message: string;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "PROCESS_MESSAGE";
    payload: {
      message: PlatformMessage;
      platform: PlatformId;
    };
  };
