import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import type Storage from "./Storage";
import type { PlatformUser, PlatformUserStorage } from "./PlatformUser";
import type {
  PlatformSession,
  PlatformSessionStorage,
} from "./PlatformSession";
import type { SessionMessage, SessionMessageStorage } from "./SessionMessage";
import type { Job, JobStorage } from "./Job";
import type { JobData } from "../jobs/types/JobData";
import type { PlatformConfig, PlatformConfigStorage } from "./PlatformConfigStorage";
import type { PlatformId } from "../platforms/Platform";

class MongoPlatformConfigStorage implements PlatformConfigStorage<ObjectId> {
  private readonly collection: Collection<Omit<PlatformConfig<ObjectId>, "id">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  async getConfig(platformId: PlatformId): Promise<PlatformConfig<ObjectId> | null> {
    const config = await this.collection.findOne({ platformId }, { sort: { updatedAt: -1 } });
    if (!config) {
      return null;
    }
    return { ...config, id: config._id };
  }

  async createConfig(config: Omit<PlatformConfig<ObjectId>, "id" | "createdAt" | "updatedAt">): Promise<void> {
    await this.collection.insertOne({
      ...config,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateConfig(config: PlatformConfig<ObjectId>): Promise<void> {
    await this.collection.updateOne({ _id: config.id }, {
      $set: {
        ...config,
        updatedAt: new Date(),
      },
    });
  }
}

class MongoPlatformUserStorage implements PlatformUserStorage<ObjectId> {
  private readonly collection: Collection<Omit<PlatformUser<ObjectId>, "id">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = this.db.collection(this.collectionName);
  }

  async getUser(id: ObjectId): Promise<PlatformUser<ObjectId> | null> {
    const user = await this.collection.findOne({ _id: id });
    if (!user) {
      return null;
    }
    return { ...user, id: user._id };
  }

  async getUsers(): Promise<PlatformUser<ObjectId>[]> {
    const users = await this.collection.find().toArray();
    return users.map((user) => ({ ...user, id: user._id }));
  }

  async getUserFromExternalId(
    externalId: string,
  ): Promise<PlatformUser<ObjectId> | null> {
    const user = await this.collection.findOne({ externalId });
    if (!user) {
      return null;
    }
    return { ...user, id: user._id };
  }

  async createUser(
    user: Omit<
      PlatformUser<ObjectId>,
      "id" | "lastInteraction" | "createdAt" | "updatedAt"
    >,
  ): Promise<PlatformUser<ObjectId>> {
    const result = await this.collection.insertOne({
      ...user,
      lastInteraction: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const platformUser = await this.collection.findOne({
      _id: result.insertedId,
    });
    if (!platformUser) {
      throw new Error("Failed to create platform user");
    }

    return { ...platformUser, id: platformUser._id };
  }

  async updateUserLastInteraction(
    id: ObjectId,
    lastInteraction: Date,
  ): Promise<void> {
    await this.collection.updateOne({ _id: id }, {
      $set: { lastInteraction, updatedAt: new Date() },
    });
  }
}

class MongoSessionMessageStorage implements SessionMessageStorage<ObjectId> {
  private readonly collection: Collection<Omit<SessionMessage<ObjectId>, "id">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  async saveMessage(
    message: Omit<SessionMessage<ObjectId>, "id" | "createdAt" | "updatedAt">,
  ): Promise<SessionMessage<ObjectId>> {
    const result = await this.collection.insertOne({
      ...message,
      platformUser: message.platformUser,
      session: message.session,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const sessionMessage = await this.collection.findOne({
      _id: result.insertedId,
    });
    if (!sessionMessage) {
      throw new Error("Failed to create session message");
    }
    return {
      ...sessionMessage,
      id: sessionMessage._id,
    };
  }

  async saveMessages(
    messages: Omit<
      SessionMessage<ObjectId>,
      "id" | "createdAt" | "updatedAt"
    >[],
  ): Promise<SessionMessage<ObjectId>[]> {
    const result = await this.collection.insertMany(messages.map((message) => ({
      ...message,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));

    if (!result.acknowledged) {
      throw new Error("Failed to save session messages");
    }

    const insertedIds = Object.values(result.insertedIds);
    const sessionMessages = await this.collection.find({
      _id: { $in: insertedIds },
    }).toArray();

    return sessionMessages.map((sessionMessage) => ({
      ...sessionMessage,
      id: sessionMessage._id,
    }));
  }
}

class MongoJobStorage<T> implements JobStorage<ObjectId, T> {
  private readonly collection: Collection<Omit<Job<ObjectId, T>, "id">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  async getScheduledJobsByName(name: string): Promise<Job<ObjectId, T>[]> {
    const jobs = await this.collection.find({ name, status: "SCHEDULED" })
      .toArray();
    return jobs.map((job) => {
      return { ...job, id: job._id };
    });
  }

  async getProcessableJobs(): Promise<Job<ObjectId, T>[]> {
    const jobs = await this.collection.find({
      status: { $in: ["SCHEDULED"] },
      dueAt: { $lte: new Date() },
    }).toArray();
    return jobs.map((job) => {
      return {
        ...job,
        id: job._id,
      };
    });
  }

  async markJobAsProcessed(job: Job<ObjectId>): Promise<void> {
    await this.collection.updateOne({ _id: job.id }, {
      $set: { status: "DONE", updatedAt: new Date() },
    });
  }

  async markJobAsFailed(job: Job<ObjectId>): Promise<void> {
    await this.collection.updateOne({ _id: job.id }, {
      $set: { status: "FAILED", updatedAt: new Date() },
    });
  }

  async clearJob(job: Job<ObjectId>): Promise<void> {
    await this.collection.deleteOne({ _id: job.id });
  }

  async clearJobs(jobs: Job<ObjectId>[]): Promise<void> {
    await this.collection.deleteMany({
      _id: { $in: jobs.map((job) => job.id) },
    });
  }

  async createJob(
    job: Omit<
      Job<ObjectId, T>,
      "id" | "createdAt" | "updatedAt" | "addMessage"
    >,
  ): Promise<Job<ObjectId, T>> {
    const result = await this.collection.insertOne({
      ...job,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const createdJob = await this.collection.findOne({
      _id: result.insertedId,
    });
    if (!createdJob) {
      throw new Error("Failed to create job");
    }
    return { ...createdJob, id: createdJob._id };
  }

  async updateJob(job: Job<ObjectId, T>): Promise<void> {
    await this.collection.updateOne({ _id: job.id }, {
      $set: { ...job, updatedAt: new Date() },
    });
  }
}

class MongoPlatformSessionStorage implements PlatformSessionStorage<ObjectId> {
  private readonly collection: Collection<
    Omit<PlatformSession<ObjectId>, "id">
  >;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  async getActiveSession(
    platformUser: ObjectId,
  ): Promise<PlatformSession<ObjectId> | null> {
    const session = await this.collection.findOne({
      platformUser: platformUser,
      status: "ACTIVE",
    });
    if (!session) {
      return null;
    }
    return {
      ...session,
      id: session._id,
    };
  }

  async createSession(
    session: Omit<
      PlatformSession<ObjectId>,
      "id" | "status" | "createdAt" | "updatedAt" | "lastInteraction"
    >,
  ): Promise<PlatformSession<ObjectId>> {
    const result = await this.collection.insertOne({
      ...session,
      status: "ACTIVE",
      lastInteraction: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const platformSession = await this.collection.findOne({
      _id: result.insertedId,
    });
    if (!platformSession) {
      throw new Error("Failed to create platform session");
    }
    return {
      ...platformSession,
      id: platformSession._id,
    };
  }

  async updateSession(
    session: PlatformSession<ObjectId>,
  ): Promise<PlatformSession<ObjectId>> {
    const result = await this.collection.updateOne({
      _id: session.id,
    }, {
      $set: {
        ...session,
        updatedAt: new Date(),
      },
    });
    if (result.modifiedCount === 0) {
      throw new Error("Failed to update platform session");
    }
    const updatedSession = await this.collection.findOne({
      _id: new ObjectId(session.id),
    });
    if (!updatedSession) {
      throw new Error("Failed to update platform session");
    }
    return {
      ...updatedSession,
      id: updatedSession._id,
    };
  }
}

export class MongoStorage implements Storage<ObjectId, JobData<ObjectId>> {
  private readonly db: Db;
  public platformConfig: PlatformConfigStorage<ObjectId>;
  public platformUser: PlatformUserStorage<ObjectId>;
  public platformSession: PlatformSessionStorage<ObjectId>;
  public sessionMessage: SessionMessageStorage<ObjectId>;
  public job: JobStorage<ObjectId, JobData<ObjectId>>;

  constructor(
    private readonly client: MongoClient,
    private readonly dbName: string,
  ) {
    this.client = client;
    this.db = client.db(dbName);

    this.platformConfig = new MongoPlatformConfigStorage(this.db, "platform_configs");
    this.platformUser = new MongoPlatformUserStorage(this.db, "platform_users");
    this.platformSession = new MongoPlatformSessionStorage(
      this.db,
      "platform_sessions",
    );
    this.sessionMessage = new MongoSessionMessageStorage(
      this.db,
      "session_messages",
    );
    this.job = new MongoJobStorage(this.db, "jobs");
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log("Connected to MongoDB");
  }

  async close(): Promise<void> {
    await this.client.close();
    console.log("Disconnected from MongoDB");
  }

  getIdFromString(str: string): ObjectId {
    console.log("Getting id from string", str);
    return new ObjectId(str);
  }

  getStringFromId(id: ObjectId): string {
    return id.toString();
  }
}

export default MongoStorage;
