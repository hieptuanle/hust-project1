import type { JobData } from "../types/JobData";
import { BaseJobHandler } from "../types/BaseJobHandler";

export class UnderstandContentHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
    if (jobData.type !== "UNDERSTAND_CONTENT") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    const text = jobData.payload.messages.map((message) =>
      message.platformMessage.message
    ).join(", ");

    console.log(`Trying to understand content: ${text}`);

    if (text.match(/giới thiệu/igm)) {
      await this.queue.add({
        name: "GREETING",
        data: {
          type: "GREETING",
          payload: {
            platformUser: jobData.payload.platformUser,
            platform: jobData.payload.platform,
            session: jobData.payload.session,
          },
        },
      });
    }

    if (text.match(/xem menu|menu|menu sản phẩm|menu sản phẩm/igm)) {
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

    if (text.match(/ngẫu nhiên|ý tưởng/igm)) {
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

    if (text.match(/(xem|tìm).*(mẫu|bánh) (.*)/igm)) {
      const query = text.match(/(xem|tìm).*(mẫu|bánh) (.*)/im)?.[3] || "";
      console.log(`Query: ${query}`);
      if (!query) {
        await this.queue.add({
          name: "RESPOND",
          data: {
            type: "RESPOND",
            payload: {
              platformUser: jobData.payload.platformUser,
              platform: jobData.payload.platform,
              session: jobData.payload.session,
              message: "Vui lòng nhập tên mẫu bạn muốn tìm kiếm.",
            },
          },
        });
        return;
      }
      await this.queue.add({
        name: "SEARCH_PRODUCT",
        data: {
          type: "SEARCH_PRODUCT",
          payload: {
            platformUser: jobData.payload.platformUser,
            platform: jobData.payload.platform,
            session: jobData.payload.session,
            query,
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
}
