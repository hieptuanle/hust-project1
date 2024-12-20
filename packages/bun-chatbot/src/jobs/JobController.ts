import type { Platform } from "../platforms";
import type { Scheduler } from "../scheduler/Scheduler";
import type Storage from "../storage/Storage";
import type { Queue } from "../queue/Queue";
import type { JobData } from "./types/JobData";
import { UnderstandContentHandler } from "./handlers/UnderstandHandler";
import { ProcessMessageHandler } from "./handlers/ProcessHandler";
import {
  GreetingHandler,
  IntroRandomProductsHandler,
  IntroWebsiteHandler,
} from "./handlers/IntroHandler";
import { RespondHandler } from "./handlers/RespondHandler";
import { SessionHandler } from "./handlers/SessionHandler";
import type { BaseJobHandler } from "./types/BaseJobHandler";

export type Job<T = JobData> = {
  id: string;
  data: T;
};

export class JobController<ID = string> {
  private handlers: Record<string, BaseJobHandler<ID>> = {};

  constructor(
    private platforms: Platform[],
    private storage: Storage<ID>,
    private scheduler: Scheduler<ID, JobData<ID>>,
    private queue: Queue<JobData>,
  ) {
    this.registerHandler(
      "PROCESS_MESSAGE",
      new ProcessMessageHandler<ID>(
        this.platforms,
        this.storage,
        this.scheduler,
        this.queue,
      ),
    );
    this.registerHandler(
      "GREETING",
      new GreetingHandler<ID>(
        this.platforms,
        this.storage,
        this.scheduler,
        this.queue,
      ),
    );
    this.registerHandler(
      "UNDERSTAND_CONTENT",
      new UnderstandContentHandler(
        this.platforms,
        this.storage,
        this.scheduler,
        this.queue,
      ),
    );
    this.registerHandler(
      "INTRO_WEBSITE",
      new IntroWebsiteHandler<ID>(
        this.platforms,
        this.storage,
        this.scheduler,
        this.queue,
      ),
    );
    this.registerHandler(
      "RESPOND",
      new RespondHandler<ID>(
        this.platforms,
        this.storage,
        this.scheduler,
        this.queue,
      ),
    );
    this.registerHandler(
      "SESSION_DONE",
      new SessionHandler<ID>(
        this.platforms,
        this.storage,
        this.scheduler,
        this.queue,
      ),
    );
    this.registerHandler(
      "INTRO_RANDOM_PRODUCTS",
      new IntroRandomProductsHandler<ID>(
        this.platforms,
        this.storage,
        this.scheduler,
        this.queue,
      ),
    );
  }

  registerHandler(type: string, handler: BaseJobHandler<ID>) {
    this.handlers[type] = handler;
  }

  async handleJob(jobData: JobData): Promise<void> {
    const handler = this.handlers[jobData.type];
    if (!handler) {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }
    await handler.handle(jobData);
  }
}
