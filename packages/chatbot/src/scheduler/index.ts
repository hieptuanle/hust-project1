import { MongoScheduler } from "./MongoScheduler";
import { mongoStorage } from "../storage";
import { bullQueue } from "../queue";

const mongoScheduler = new MongoScheduler(mongoStorage, 1000, bullQueue);

export default mongoScheduler;
