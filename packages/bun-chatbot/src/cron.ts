import type { IJobHandler } from "./JobHandler";
import type Storage from "./storage/Storage";

export class Cron {
  constructor(
    private storage: Storage,
    private jobHandler: IJobHandler,
  ) { }

  async *subscribeToJobs() {
    while (true) {
      const jobs = await this.storage.job.getProcessableJobs();
      yield jobs;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
    }
  }

  async start() {
    for await (const jobs of this.subscribeToJobs()) {
      for (const job of jobs) {
        console.log("Handling job %s type %s", job.id, job.type);
        this.jobHandler
          .handleJob(job)
          .then(() => {
            this.storage.job.markJobAsProcessed(job);
          })
          .catch((error) => {
            this.storage.job.markJobAsFailed(job);
            console.error("Failed to handle job:", error);
          });
      }
    }
  }
}
