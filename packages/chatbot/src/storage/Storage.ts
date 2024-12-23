import type { PlatformUserStorage } from "./PlatformUser";
import type { PlatformSessionStorage } from "./PlatformSession";
import type { SessionMessageStorage } from "./SessionMessage";
import type { JobStorage } from "./Job";
import type { PlatformConfigStorage } from "./PlatformConfigStorage";

export default interface Storage<ID = string, T = unknown> {
  platformConfig: PlatformConfigStorage<ID>;
  platformUser: PlatformUserStorage<ID>;
  platformSession: PlatformSessionStorage<ID>;
  sessionMessage: SessionMessageStorage<ID>;
  job: JobStorage<ID, T>;
  getIdFromString(str: string): ID;
  getStringFromId(id: ID): string;
  connect(): Promise<void>;
  close(): Promise<void>;
}
