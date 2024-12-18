export interface JobStorage<ID = string, T = unknown> {
  getProcessableJobs(): Promise<Job<ID, T>[]>;
  getScheduledJobsByName(name: string): Promise<Job<ID, T>[]>;
  markJobAsProcessed(job: Job<ID, T>): Promise<void>;
  markJobAsFailed(job: Job<ID, T>): Promise<void>;
  clearJob(job: Job<ID, T>): Promise<void>;
  clearJobs(jobs: Job<ID, T>[]): Promise<void>;
  createJob(
    job: Omit<Job<ID, T>, "id" | "createdAt" | "updatedAt">,
  ): Promise<Job<ID, T>>;
  updateJob(job: Job<ID, T>): Promise<void>;
}

export type JobStatus = "SCHEDULED" | "DONE" | "FAILED" | "CANCELLED";

export interface Job<ID = string, T = unknown> {
  id: ID;
  name: string;
  status: JobStatus;
  data: T;
  debounceDuration: number; // in milliseconds
  dueAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
