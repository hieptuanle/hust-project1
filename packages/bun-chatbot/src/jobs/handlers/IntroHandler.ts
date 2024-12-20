import type { JobData } from "../types/JobData";
import { BaseJobHandler } from "../types/BaseJobHandler";

export class IntroHandler extends BaseJobHandler {
  async handle(jobData: JobData<string>) {
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
}

export class GreetingHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
    if (jobData.type !== "GREETING") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }

    await this.queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message:
            `Cake AI Chatbot chào quý khách ạ. Cake AI Chatbot có thể thực hiện các lệnh sau, trong ngoặc là cú pháp:
1. Giới thiệu về sản phẩm (Giới thiệu)
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
}

export class IntroRandomProductsHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
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
}

export class IntroWebsiteHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
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
}
