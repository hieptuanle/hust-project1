import { MongoClient } from "mongodb";
import { MongoStorage } from "./MongoStorage";
import { z } from "zod";

const envSchema = z.object({
  MONGO_URI: z.string(),
  MONGO_DB_NAME: z.string(),
});

let env;

env = envSchema.parse(process.env);
const mongoClient = new MongoClient(env.MONGO_URI);
const mongoStorage = new MongoStorage(mongoClient, env.MONGO_DB_NAME);

export { mongoStorage };
