import type { JobController } from "../jobs/JobController";

export interface Worker<ID = string> {
  readonly queueId: string;
  readonly jobHandler: JobController<ID>;
  onFailed(job: unknown, error: Error): Promise<void>;
  close(): Promise<void>;
}
