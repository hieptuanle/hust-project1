import type { Platform } from "./platforms";
import type { PlatformId, PlatformMessage } from "./platforms/Platform";

import type { Scheduler } from "./scheduler/Scheduler";
import type { SessionMessage } from "./storage/SessionMessage";

import type Storage from "./storage/Storage";
import dayjs from "dayjs";
import type { Queue } from "./queue/Queue";

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
    type: "SESSION_DONE",
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
    type: 'INTRO_RANDOM_PRODUCTS'
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_PRODUCT_DETAILS"
    payload: {
      productId: ID;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "CUSTOMER_SELECT_PRODUCT"
    payload: {
      productId: ProductId;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "CUSTOMER_SELECT_PRODUCT_OPTION"
    payload: {
      productId: ProductId;
      optionId: ProductOptionId;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_PRODUCT_OPTIONS"
    payload: {
      productId: ProductId;
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_SHIPPING_FORM"
    payload: {
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "CUSTOMER_FILL_SHIPPING_FORM"
    payload: {
      messages: SessionMessage<ID>[];
      platformUser: ID;
      platform: PlatformId;
      session: ID;
    };
  }
  | {
    type: "SHOW_PAYMENT_FORM"
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

export type Job<T = JobData> = {
  id: string;
  data: T;
};

export class JobHandler<ID = string> {
  constructor(private platforms: Platform[], private storage: Storage<ID>, private scheduler: Scheduler<ID, JobData<ID>>, private queue: Queue<JobData>) { }

  async handleJob(jobData: JobData): Promise<void> {
    switch (jobData.type) {
      case "PROCESS_MESSAGE":
        await this.handleProcessMessage(jobData);
        break;
      case "GREETING":
        await this.handleGreeting(jobData);
        break;
      case "UNDERSTAND_CONTENT":
        await this.handleUnderstandContent(jobData);
        break;
      case "INTRO_WEBSITE":
        await this.handleIntroWebsite(jobData);
        break;
      case "RESPOND":
        await this.handleRespond(jobData);
        break;
      case "SESSION_DONE":
        await this.handleSessionDone(jobData);
        break;
      case "INTRO_RANDOM_PRODUCTS":
        await this.handleIntroRandomProducts(jobData);
        break;
      default:
        throw new Error(`Unknown job type: ${jobData.type}`);
    }
  }

  async handleIntroRandomProducts(jobData: JobData) {
    if (jobData.type !== "INTRO_RANDOM_PRODUCTS") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    await this.queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: "Sản phẩm 1: https://www.savor.vn/products/1",
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      },
    });
    await this.queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: "Sản phẩm 2: https://www.savor.vn/products/2",
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      },
    });
    await this.queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: "Sản phẩm 3: https://www.savor.vn/products/3",
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      },
    });
  }

  async handleProcessMessage(jobData: JobData) {
    if (jobData.type !== "PROCESS_MESSAGE") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    let user = await this.storage.platformUser.getUserFromExternalId(
      jobData.payload.message.sender,
    );
    if (!user) {
      user = await this.storage.platformUser.createUser({
        platform: jobData.payload.platform,
        externalId: jobData.payload.message.sender,
      });
    }

    let session = await this.storage.platformSession.getActiveSession(
      user.id,
    );
    if (!session) {
      session = await this.storage.platformSession.createSession({
        platform: jobData.payload.platform,
        platformUser: user.id,
        status: "ACTIVE",
      });

      // add greeting job if no session found
      await this.queue.add({
        name: "GREETING " + this.storage.getStringFromId(user.id),
        data: {
          type: "GREETING",
          payload: {
            platformUser: this.storage.getStringFromId(user.id),
            platform: jobData.payload.platform,
            session: this.storage.getStringFromId(session.id),
          },
        },
      });
    }

    // save message to storage
    const sessionMessage = await this.storage.sessionMessage.saveMessage({
      platformUser: user.id,
      platform: jobData.payload.platform,
      session: session.id,
      platformMessage: jobData.payload.message,
    });

    // should add a scheduler to understand content and debounce it
    await this.scheduler.schedule({
      name: `UNDERSTAND_CONTENT ${jobData.payload.message.sender}`,
      debounceDuration: 3000,
      dueAt: dayjs().add(3, "second").toDate(),
      data: {
        payload: {
          messages: [sessionMessage],
          platformUser: user.id,
          platform: jobData.payload.platform,
          session: session.id,
        },
        type: "UNDERSTAND_CONTENT",
      },
    });
  }

  async handleUnderstandContent(jobData: JobData<string>) {
    if (jobData.type !== "UNDERSTAND_CONTENT") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    const text = jobData.payload.messages.map((message) =>
      message.platformMessage.message
    ).join(", ");

    console.log(`Trying to understand content: ${text}`);

    if (text.match(/giới thiệu/igm)) {
      await this.queue.add({
        name: "INTRO_WEBSITE",
        data: {
          type: "INTRO_WEBSITE",
          payload: {
            platformUser: jobData.payload.platformUser,
            platform: jobData.payload.platform,
            session: jobData.payload.session,
          },
        },
      });
    }

    if (text.match(/xem mẫu/igm)) {
      await this.queue.add({
        name: "INTRO_RANDOM_PRODUCTS",
        data: {
          type: "INTRO_RANDOM_PRODUCTS",
          payload: {
            platformUser: jobData.payload.platformUser,
            platform: jobData.payload.platform,
            session: jobData.payload.session,
          },
        },
      });
    }

    if (text.match(/tạm biệt/igm)) {
      await this.queue.add({
        name: "SESSION_DONE",
        data: {
          type: "SESSION_DONE",
          payload: {
            platformUser: jobData.payload.platformUser,
            platform: jobData.payload.platform,
            session: jobData.payload.session,
          },
        },
      });
    }
  }


  async getUserExternalId(userId: ID) {
    const user = await this.storage.platformUser.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    return user.externalId;
  }

  async handleIntroWebsite(jobData: JobData) {
    if (jobData.type !== "INTRO_WEBSITE") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    await this.queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: `Mời quý khách tham khảo website tại https://www.savor.vn`,
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      },
    });
  }

  async handleGreeting(jobData: JobData) {
    if (jobData.type !== "GREETING") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }

    await this.queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: `Cake AI Chatbot chào quý khách ạ. Cake AI Chatbot có thể thực hiện các lệnh sau, trong ngoặc là cú pháp:
1. Giới thiệu vền sản phẩm (Giới thiệu)
2. Xem mẫu (Xem mẫu)
3. Tạm biệt (Tạm biệt)
Các câu hỏi khác Cake AI Chatbot sẽ cố gắng hết sức để trả lời quý khách.
`,
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      },
    });
  }

  getPlatform(platformId: PlatformId) {
    const platform = this.platforms.find((platform) =>
      platform.id === platformId
    );
    if (!platform) {
      throw new Error(`Platform ${platformId} not found`);
    }
    return platform;
  }

  async handleRespond(jobData: JobData) {
    if (jobData.type !== "RESPOND") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    const platform = this.getPlatform(jobData.payload.platform);
    const userExternalId = await this.getUserExternalId(
      this.storage.getIdFromString(jobData.payload.platformUser),
    );
    await platform.sendMessage({
      receiver: userExternalId,
      message: jobData.payload.message,
    });
  }

  async handleSessionDone(jobData: JobData) {
    if (jobData.type !== "SESSION_DONE") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    const session = await this.storage.platformSession.getActiveSession(
      this.storage.getIdFromString(jobData.payload.platformUser),
    );
    if (session) {
      await this.storage.platformSession.updateSession({
        ...session,
        status: "DONE",
      });
    }

    await this.queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: "Shop xin phép đóng phiên chat tại đây ạ",
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      },
    });
  }
}
