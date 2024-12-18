import { SessionMessage } from "./SessionMessage";

export interface JobStorage {
  getProcessableJobs(platformUserId: string): Promise<Job[]>;
  markJobAsProcessed(job: Job): Promise<void>;
  markJobAsFailed(job: Job): Promise<void>;
  clearJob(job: Job): Promise<void>;
  clearJobs(jobs: Job[]): Promise<void>;
  createJob(
    job: Omit<Job, "id" | "createdAt" | "updatedAt" | "addMessage">,
  ): Promise<Job>;
  updateJob(job: Job): Promise<void>;
}

export type JobType = "GREETING" | "BYE" | "UNDERSTAND_CONTENT";
export type JobStatus = "PENDING" | "DONE" | "FAILED" | "CANCELLED";

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  data: {
    sessionId: string;
    messages: SessionMessage[];
  };
  dueAt: Date;
  createdAt: Date;
  updatedAt: Date;

  addMessage(message: SessionMessage): void;
}
