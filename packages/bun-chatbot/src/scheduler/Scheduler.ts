export interface ScheduleJob<ID = string, T = unknown> {
  readonly id: ID;
  name: string;
  debounceDuration: number; // in milliseconds
  dueAt: Date;
  data: T;
}

export interface Scheduler<ID, T = unknown> {
  schedule(job: Omit<ScheduleJob<ID, T>, "id">): Promise<void>;
  start(): Promise<void> | void;
  generateNextJobs(): AsyncGenerator<ScheduleJob<ID, T>[], void, unknown>;
}
