import process from 'node:process'
import { BullWorker } from "./worker/BullWorker";
import { z } from "zod";
import type { ObjectId } from "mongodb";
import { jobController } from "./jobs";

const envSchema = z.object({
  QUEUE_NAME: z.string(),
});

const env = envSchema.parse(process.env);
const worker = new BullWorker<ObjectId>(env.QUEUE_NAME, jobController);

export default worker;
