import { BullQueue } from "./BullQueue";

import { z } from "zod";

const envSchema = z.object({
  QUEUE_NAME: z.string(),
});

const env = envSchema.parse(process.env);

export const bullQueue = new BullQueue(env.QUEUE_NAME);