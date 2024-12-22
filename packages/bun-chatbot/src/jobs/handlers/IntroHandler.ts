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
1. Chào và giới thiệu về chat bot (chào)
2. Xem menu (menu)
3. Giới thiệu các mẫu ngẫu nhiên (ngẫu nhiên)
4. Tìm kiếm mẫu (Tìm mẫu <tên mẫu>)
5. Tạm biệt và đóng phiên chat (Tạm biệt)
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
