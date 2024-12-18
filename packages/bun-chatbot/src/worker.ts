import { BullWorker } from "./queue/BullWorker";
import { mongoStorage } from "./storage";
import { JobHandler } from "./JobHandler";
import { bullQueue } from "./queue";
import { platforms } from "./platforms";
import mongoScheduler from "./scheduler";
import { z } from "zod";
import type { ObjectId } from "mongodb";

const envSchema = z.object({
  QUEUE_NAME: z.string(),
});

const env = envSchema.parse(process.env);
const jobHandler = new JobHandler(platforms, mongoStorage, mongoScheduler, bullQueue);
const worker = new BullWorker<ObjectId>(env.QUEUE_NAME, jobHandler);

export default worker;
