import type { ObjectId } from "mongodb";
import type { JobData } from "../jobs/types/JobData";
import type { Job } from "../storage/Job";
import type Storage from "../storage/Storage";
import type { ScheduleJob, Scheduler } from "./Scheduler";
import type { Queue } from "../queue/Queue";

export class MongoScheduler implements Scheduler<ObjectId, JobData<ObjectId>> {
  private interval: number;
  private queue: Queue;

  constructor(
    private storage: Storage<ObjectId, JobData<ObjectId>>,
    interval: number = 1000,
    queue: Queue<JobData<ObjectId>>,
  ) {
    this.interval = interval;
    this.queue = queue;
  }

  async *generateNextJobs(): AsyncGenerator<
    Job<ObjectId, JobData<ObjectId>>[],
    void,
    unknown
  > {
    while (true) {
      const jobs = await this.storage.job.getProcessableJobs();
      yield jobs;
      await new Promise((resolve) => setTimeout(resolve, this.interval));
    }
  }

  async schedule(
    job: Omit<ScheduleJob<ObjectId, JobData<ObjectId>>, "id">,
  ): Promise<void> {
    if (job.debounceDuration > 0) {
      const existingJobs = await this.storage.job.getScheduledJobsByName(
        job.name,
      );
      if (existingJobs.length > 0) {
        for (const existingJob of existingJobs) {
          existingJob.dueAt = new Date(
            existingJob.dueAt.getTime() + job.debounceDuration,
          );

          // NOTE: Don't know other way to append messages to the existing job
          if (
            existingJob.data.type === "UNDERSTAND_CONTENT" &&
            job.data.type === "UNDERSTAND_CONTENT"
          ) {
            existingJob.data.payload.messages.push(
              job.data.payload.messages[0],
            );
          }

          await this.storage.job.updateJob(existingJob);
        }
      } else {
        await this.storage.job.createJob({
          name: job.name,
          data: job.data,
          status: "SCHEDULED",
          dueAt: job.dueAt,
          debounceDuration: job.debounceDuration,
        });
      }
    } else {
      await this.storage.job.createJob({
        name: job.name,
        data: job.data,
        status: "SCHEDULED",
        dueAt: job.dueAt,
        debounceDuration: job.debounceDuration,
      });
    }
  }

  async start(): Promise<void> {
    for await (const jobs of this.generateNextJobs()) {
      for (const job of jobs) {
        try {
          await this.queue.add({
            name: job.name,
            data: job.data,
          });
          await this.storage.job.markJobAsProcessed(job);
        } catch (error) {
          await this.storage.job.markJobAsFailed(job);
          console.error("Failed to handle job %s: %s", job.id, error);
        }
      }
    }
  }
}
