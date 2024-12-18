import { PlatformUserStorage } from "./PlatformUser";
import { PlatformSessionStorage } from "./PlatformSession";
import { SessionMessageStorage } from "./SessionMessage";
import { JobStorage } from "./Job";

export default interface Storage {
  platformUser: PlatformUserStorage;
  platformSession: PlatformSessionStorage;
  sessionMessage: SessionMessageStorage;
  job: JobStorage;
  connect(): Promise<void>;
  close(): Promise<void>;
}
