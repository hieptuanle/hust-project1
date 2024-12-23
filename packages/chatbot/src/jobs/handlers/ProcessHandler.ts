import dayjs from "dayjs";
import type { JobData } from "../types/JobData";
import { BaseJobHandler } from "../types/BaseJobHandler";

export class ProcessMessageHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData) {
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

    console.log("session", session);

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
}
