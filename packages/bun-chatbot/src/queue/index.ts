import { BullQueue } from "./BullQueue";
import { processEnv } from "../env";

export const bullQueue = new BullQueue(processEnv.QUEUE_NAME);
