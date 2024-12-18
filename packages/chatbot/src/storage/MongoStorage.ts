import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import Storage from "./Storage";
import { PlatformUser, PlatformUserStorage } from "./PlatformUser";
import { PlatformSession, PlatformSessionStorage } from "./PlatformSession";
import { SessionMessage, SessionMessageStorage } from "./SessionMessage";
import { Job, JobStatus, JobStorage, JobType } from "./Job";

class MongoPlatformUserStorage implements PlatformUserStorage {
  private readonly collection: Collection<Omit<PlatformUser, "id">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  async getUserFromExternalId(
    externalId: string,
  ): Promise<PlatformUser | null> {
    const user = await this.collection.findOne({ externalId });
    if (!user) {
      return null;
    }
    return { ...user, id: user._id.toString() };
  }

  async createUser(
    user: Omit<
      PlatformUser,
      "id" | "lastInteraction" | "createdAt" | "updatedAt"
    >,
  ): Promise<PlatformUser> {
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

    return { ...platformUser, id: platformUser._id.toString() };
  }

  async updateUserLastInteraction(
    id: string,
    lastInteraction: Date,
  ): Promise<void> {
    await this.collection.updateOne({ _id: new ObjectId(id) }, {
      $set: { lastInteraction },
    });
  }
}

class MongoSessionMessageStorage implements SessionMessageStorage {
  private readonly collection: Collection<Omit<SessionMessage, "id">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  async saveMessage(
    message: Omit<SessionMessage, "id" | "createdAt" | "updatedAt">,
  ): Promise<SessionMessage> {
    const result = await this.collection.insertOne({
      ...message,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const sessionMessage = await this.collection.findOne({
      _id: result.insertedId,
    });
    if (!sessionMessage) {
      throw new Error("Failed to create session message");
    }
    return { ...sessionMessage, id: sessionMessage._id.toString() };
  }

  async saveMessages(
    messages: Omit<SessionMessage, "id" | "createdAt" | "updatedAt">[],
  ): Promise<SessionMessage[]> {
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
      id: sessionMessage._id.toString(),
    }));
  }
}

class MongoJob implements Job {
  id: string;
  type: JobType;
  status: JobStatus;
  data: {
    sessionId: string;
    messages: SessionMessage[];
  };
  dueAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(job: Omit<Job, "addMessage">) {
    this.id = job.id;
    this.type = job.type;
    this.status = job.status;
    this.data = job.data;
    this.dueAt = job.dueAt;
    this.createdAt = job.createdAt;
    this.updatedAt = job.updatedAt;
  }

  addMessage(message: SessionMessage): void {
    this.data.messages.push(message);
  }
}

class MongoJobStorage implements JobStorage {
  private readonly collection: Collection<Omit<Job, "id" | "addMessage">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  static async addMessage(job: Job, message: SessionMessage) {
    job.data.messages.push(message);
  }

  async getProcessableJobs(): Promise<Job[]> {
    const jobs = await this.collection.find({ status: "PENDING" }).toArray();
    return jobs.map((job) => {
      return new MongoJob({
        ...job,
        id: job._id.toString(),
      });
    });
  }

  async markJobAsProcessed(job: Job): Promise<void> {
    await this.collection.updateOne({ _id: new ObjectId(job.id) }, {
      $set: { status: "DONE" },
    });
  }

  async markJobAsFailed(job: Job): Promise<void> {
    await this.collection.updateOne({ _id: new ObjectId(job.id) }, {
      $set: { status: "FAILED" },
    });
  }

  async clearJob(job: Job): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(job.id) });
  }

  async clearJobs(jobs: Job[]): Promise<void> {
    await this.collection.deleteMany({
      _id: { $in: jobs.map((job) => new ObjectId(job.id)) },
    });
  }

  async createJob(
    job: Omit<Job, "id" | "createdAt" | "updatedAt" | "addMessage">,
  ): Promise<Job> {
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
    return new MongoJob({ ...createdJob, id: createdJob._id.toString() });
  }

  async updateJob(job: Job): Promise<void> {
    await this.collection.updateOne({ _id: new ObjectId(job.id) }, {
      $set: { ...job, updatedAt: new Date() },
    });
  }
}

class MongoPlatformSessionStorage implements PlatformSessionStorage {
  private readonly collection: Collection<Omit<PlatformSession, "id">>;

  constructor(
    private readonly db: Db,
    private readonly collectionName: string,
  ) {
    this.collection = db.collection(collectionName);
  }

  async getActiveSession(userId: string): Promise<PlatformSession | null> {
    const session = await this.collection.findOne({ userId, status: "ACTIVE" });
    if (!session) {
      return null;
    }
    return { ...session, id: session._id.toString() };
  }

  async createSession(
    session: Omit<
      PlatformSession,
      "id" | "status" | "createdAt" | "updatedAt" | "lastInteraction"
    >,
  ): Promise<PlatformSession> {
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
    return { ...platformSession, id: platformSession._id.toString() };
  }

  async updateSession(session: PlatformSession): Promise<PlatformSession> {
    const result = await this.collection.updateOne({
      _id: new ObjectId(session.id),
    }, { $set: { ...session, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new Error("Failed to update platform session");
    }
    const updatedSession = await this.collection.findOne({
      _id: new ObjectId(session.id),
    });
    if (!updatedSession) {
      throw new Error("Failed to update platform session");
    }
    return { ...updatedSession, id: updatedSession._id.toString() };
  }
}

export class MongoStorage implements Storage {
  private readonly db: Db;

  public platformUser: PlatformUserStorage;
  public platformSession: PlatformSessionStorage;
  public sessionMessage: SessionMessageStorage;
  public job: JobStorage;

  constructor(
    private readonly client: MongoClient,
    private readonly dbName: string,
  ) {
    this.client = client;
    this.db = client.db(dbName);

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
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

export default MongoStorage;
