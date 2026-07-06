// ProfileHandlers manage the loading of a config, allowing us to abstract over different ways of getting to a DwarfConfig

import { ConfigResult } from "@dwarfdev/config-yaml";
import { DwarfConfig } from "../../index.js";
import { ProfileDescription } from "../ProfileLifecycleManager.js";

// After we have the DwarfConfig, the ConfigHandler takes care of everything else (loading models, lifecycle, etc.)
export interface IProfileLoader {
  description: ProfileDescription;
  doLoadConfig(): Promise<ConfigResult<DwarfConfig>>;
  setIsActive(isActive: boolean): void;
}
