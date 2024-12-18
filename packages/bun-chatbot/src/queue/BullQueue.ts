import { Queue as BullMQQueue } from 'bullmq';
import type { Queue, QueueJob } from './Queue';

export class BullQueue implements Queue {
  private readonly queue: BullMQQueue;
  readonly queueId: string;

  constructor(queueId: string) {
    this.queueId = queueId;
    this.queue = new BullMQQueue(queueId);
    console.log("Queue started");
  }

  async add(job: Omit<QueueJob, "id">): Promise<void> {
    const addedJob = await this.queue.add(job.name, job.data);
    console.log("Job added %s %s", addedJob.id, job.name);
  }
}
