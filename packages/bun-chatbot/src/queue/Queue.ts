
export interface QueueJob<T = unknown> {
  readonly id: string;
  name: string;
  data: T;
}

export interface Queue<T = unknown> {
  readonly queueId: string;
  add(job: Omit<QueueJob<T>, "id">): Promise<void>;
}
