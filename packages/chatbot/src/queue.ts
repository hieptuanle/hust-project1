import { PlatformMessage } from "./platforms/Platform";
import Storage from "./storage/Storage";
import { MongoStorage } from "./storage/MongoStorage";
import { z } from "zod";
import { MongoClient } from "mongodb";

const envSchema = z.object({
  MONGO_URI: z.string(),
  MONGO_DB_NAME: z.string(),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error(error);
  process.exit(1);
}

const mongoClient = new MongoClient(env.MONGO_URI);
const mongoStorage = new MongoStorage(mongoClient, env.MONGO_DB_NAME);
await mongoClient.connect();

export default async function queue(message: MessageBatch<PlatformMessage>) {
  const messages = message.messages;
  for (const message of messages) {
    processMessage(message.body, mongoStorage);
  }
}

const DELAY_EXTRACT_INFO = 1000 * 3; // 3 seconds

async function processMessage(
  platformMessage: PlatformMessage,
  storage: Storage,
) {
  let user = await storage.platformUser.getUserFromExternalId(
    platformMessage.sender,
  );
  if (!user) {
    user = await storage.platformUser.createUser({
      platform: platformMessage.platform,
      externalId: platformMessage.sender,
    });
  }
  await storage.platformUser.updateUserLastInteraction(
    user.id,
    new Date(platformMessage.timestamp),
  );

  let session = await storage.platformSession.getActiveSession(user.id);
  if (!session) {
    session = await storage.platformSession.createSession({
      platformUserId: user.id,
      platformId: platformMessage.platform,
      status: "ACTIVE",
    });
  }

  const sessionMessage = await storage.sessionMessage.saveMessage({
    platformUserId: user.id,
    platformId: platformMessage.platform,
    sessionId: session.id,
    platformMessage: platformMessage,
  });

  const jobs = await storage.job.getProcessableJobs(user.id);

  let hasUnderstandContentJob = false;
  for (const job of jobs) {
    if (job.type === "UNDERSTAND_CONTENT") {
      job.addMessage(sessionMessage);
      job.dueAt = new Date(job.dueAt.getTime() + DELAY_EXTRACT_INFO);
      await storage.job.updateJob(job);
      hasUnderstandContentJob = true;
    }
  }
  if (!hasUnderstandContentJob) {
    await storage.job.createJob({
      type: "UNDERSTAND_CONTENT",
      status: "PENDING",
      data: {
        sessionId: session.id,
        messages: [sessionMessage],
      },
      dueAt: new Date(Date.now() + DELAY_EXTRACT_INFO),
    });
  }
}
