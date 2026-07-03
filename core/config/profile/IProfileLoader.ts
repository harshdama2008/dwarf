// ProfileHandlers manage the loading of a config, allowing us to abstract over different ways of getting to a MangoConfig

import { ConfigResult } from "@mangodev/config-yaml";
import { MangoConfig } from "../../index.js";
import { ProfileDescription } from "../ProfileLifecycleManager.js";

// After we have the MangoConfig, the ConfigHandler takes care of everything else (loading models, lifecycle, etc.)
export interface IProfileLoader {
  description: ProfileDescription;
  doLoadConfig(): Promise<ConfigResult<MangoConfig>>;
  setIsActive(isActive: boolean): void;
}
