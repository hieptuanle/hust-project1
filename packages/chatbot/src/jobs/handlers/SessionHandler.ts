import type { JobData } from "../types/JobData";
import { BaseJobHandler } from "../types/BaseJobHandler";

export class SessionHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
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
