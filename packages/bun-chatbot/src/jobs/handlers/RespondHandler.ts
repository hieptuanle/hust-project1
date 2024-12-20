import type { JobData } from "../types/JobData";
import { BaseJobHandler } from "../types/BaseJobHandler";

export class RespondHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
    if (jobData.type !== "RESPOND") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    const platform = this.platforms.find((platform) =>
      platform.id === jobData.payload.platform
    );
    if (!platform) {
      throw new Error(`Platform ${jobData.payload.platform} not found`);
    }
    const user = await this.storage.platformUser.getUser(
      this.storage.getIdFromString(jobData.payload.platformUser),
    );
    if (!user) {
      throw new Error(`User ${jobData.payload.platformUser} not found`);
    }
    await platform.sendMessage({
      receiver: user.externalId,
      message: jobData.payload.message,
    });
  }
}
