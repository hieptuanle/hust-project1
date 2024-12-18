import type { Job, JobHandler } from "../JobHandler";

export interface Worker<ID = string> {
  readonly queueId: string;
  readonly jobHandler: JobHandler<ID>;
  onFailed(job: unknown, error: Error): Promise<void>;
  close(): Promise<void>;
}
