import { JobController } from "./JobController";
import { platforms } from "../platforms";
import { mongoStorage } from "../storage";
import { bullQueue } from "../queue";
import mongoScheduler from "../scheduler";
import { productController } from "../resources";

export const jobController = new JobController(
  platforms,
  mongoStorage,
  mongoScheduler,
  bullQueue,
  productController,
);
