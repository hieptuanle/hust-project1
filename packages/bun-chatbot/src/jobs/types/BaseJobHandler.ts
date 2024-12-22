import type { Platform } from "../../platforms";
import type { JobData } from "./JobData";
import type Storage from "../../storage/Storage";
import type { Scheduler } from "../../scheduler/Scheduler";
import type { Queue } from "../../queue/Queue";
import type { ProductController } from "../../resources/Product";

export abstract class BaseJobHandler<ID = string> {
  constructor(
    protected platforms: Platform[],
    protected storage: Storage<ID>,
    protected scheduler: Scheduler<ID, JobData<ID>>,
    protected queue: Queue<JobData>,
    protected productController: ProductController,
  ) { }
  abstract handle(jobData: JobData): Promise<void>;
}
