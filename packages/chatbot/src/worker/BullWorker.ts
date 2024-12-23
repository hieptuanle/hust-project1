import type { JobController } from "../jobs/JobController";
import { type Job, Worker as BullMQWorker } from "bullmq";
import type { Worker } from "./Worker";
import IORedis from "ioredis";

const connection = new IORedis({ maxRetriesPerRequest: null });

export class BullWorker<ID> implements Worker<ID> {
  readonly queueId: string;
  private readonly worker: BullMQWorker;
  readonly jobHandler: JobController<ID>;

  constructor(queueId: string, jobHandler: JobController<ID>) {
    this.queueId = queueId;
    this.jobHandler = jobHandler;
    this.worker = new BullMQWorker(queueId, async (job) => {
      console.log("Handling job %s %s", job.id, job.data?.type ?? "unknown");
      await this.jobHandler.handleJob(job.data);
    }, { connection });
    this.worker.on("failed", (job, error) => this.onFailed(job, error));
    console.log("Worker started");
  }

  // deno-lint-ignore require-await
  async onFailed(job: Job | undefined, error: Error) {
    console.error("Job failed", job?.id, error);
  }

  async close() {
    await this.worker.close();
  }
}
