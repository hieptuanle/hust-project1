import { MongoClient } from "mongodb";
import { MongoStorage } from "./MongoStorage";
import { processEnv } from "../env";

const mongoClient = new MongoClient(processEnv.MONGO_URI);
const mongoStorage = new MongoStorage(mongoClient, processEnv.MONGO_DB_NAME);

export { mongoStorage };
