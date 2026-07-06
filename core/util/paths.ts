import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as URI from "uri-js";
import * as YAML from "yaml";

import { ConfigYaml } from "@dwarfdev/config-yaml";
import * as JSONC from "comment-json";
import dotenv from "dotenv";

import { IdeType, SerializedDwarfConfig } from "../";
import { defaultConfig } from "../config/default";
import Types from "../config/types";

dotenv.config();

export function setConfigFilePermissions(filePath: string): void {
  try {
    if (os.platform() !== "win32") {
      fs.chmodSync(filePath, 0o600);
    }
  } catch (error) {
    console.warn(`Failed to set permissions on ${filePath}:`, error);
  }
}

const DWARF_GLOBAL_DIR = (() => {
  const configPath = process.env.DWARF_GLOBAL_DIR;
  if (configPath) {
    // Convert relative path to absolute paths based on current working directory
    return path.isAbsolute(configPath)
      ? configPath
      : path.resolve(process.cwd(), configPath);
  }
  return path.join(os.homedir(), ".dwarf");
})();

// export const DEFAULT_CONFIG_TS_CONTENTS = `import { Config } from "./types"\n\nexport function modifyConfig(config: Config): Config {
//   return config;
// }`;

export const DEFAULT_CONFIG_TS_CONTENTS = `export function modifyConfig(config: Config): Config {
  return config;
}`;

export function getChromiumPath(): string {
  return path.join(getDwarfUtilsPath(), ".chromium-browser-snapshots");
}

export function getDwarfUtilsPath(): string {
  const utilsPath = path.join(getDwarfGlobalPath(), ".utils");
  if (!fs.existsSync(utilsPath)) {
    fs.mkdirSync(utilsPath);
  }
  return utilsPath;
}

export function getGlobalDwarfIgnorePath(): string {
  const dwarfIgnorePath = path.join(getDwarfGlobalPath(), ".dwarfignore");
  if (!fs.existsSync(dwarfIgnorePath)) {
    fs.writeFileSync(dwarfIgnorePath, "");
  }
  return dwarfIgnorePath;
}

export function getDwarfGlobalPath(): string {
  // This is ~/.dwarf on mac/linux
  const dwarfPath = DWARF_GLOBAL_DIR;
  if (!fs.existsSync(dwarfPath)) {
    fs.mkdirSync(dwarfPath);
  }
  return dwarfPath;
}

export function getSessionsFolderPath(): string {
  const sessionsPath = path.join(getDwarfGlobalPath(), "sessions");
  if (!fs.existsSync(sessionsPath)) {
    fs.mkdirSync(sessionsPath);
  }
  return sessionsPath;
}

export function getIndexFolderPath(): string {
  const indexPath = path.join(getDwarfGlobalPath(), "index");
  if (!fs.existsSync(indexPath)) {
    fs.mkdirSync(indexPath);
  }
  return indexPath;
}

export function getGlobalContextFilePath(): string {
  return path.join(getIndexFolderPath(), "globalContext.json");
}

export function getSharedConfigFilePath(): string {
  return path.join(getDwarfGlobalPath(), "sharedConfig.json");
}

export function getSessionFilePath(sessionId: string): string {
  return path.join(getSessionsFolderPath(), `${sessionId}.json`);
}

export function getSessionsListPath(): string {
  const filepath = path.join(getSessionsFolderPath(), "sessions.json");
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify([]));
  }
  return filepath;
}

export function getConfigJsonPath(): string {
  const p = path.join(getDwarfGlobalPath(), "config.json");
  return p;
}

export function getConfigYamlPath(ideType?: IdeType): string {
  const p = path.join(getDwarfGlobalPath(), "config.yaml");
  const exists = fs.existsSync(p);
  const isEmpty = exists && fs.readFileSync(p, "utf8").trim() === "";
  const needsCreation = !exists && !fs.existsSync(getConfigJsonPath());

  if (needsCreation || isEmpty) {
    fs.writeFileSync(p, YAML.stringify(defaultConfig));
    setConfigFilePermissions(p);
  }
  return p;
}

export function getPrimaryConfigFilePath(): string {
  const configYamlPath = getConfigYamlPath();
  if (fs.existsSync(configYamlPath)) {
    return configYamlPath;
  }
  return getConfigJsonPath();
}

export function getConfigTsPath(): string {
  const p = path.join(getDwarfGlobalPath(), "config.ts");
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, DEFAULT_CONFIG_TS_CONTENTS);
  }

  const typesPath = path.join(getDwarfGlobalPath(), "types");
  if (!fs.existsSync(typesPath)) {
    fs.mkdirSync(typesPath);
  }
  const corePath = path.join(typesPath, "core");
  if (!fs.existsSync(corePath)) {
    fs.mkdirSync(corePath);
  }
  const packageJsonPath = path.join(getDwarfGlobalPath(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({
        name: "dwarf-config",
        version: "1.0.0",
        description: "My Dwarf Configuration",
        main: "config.js",
      }),
    );
  }

  fs.writeFileSync(path.join(corePath, "index.d.ts"), Types);
  return p;
}

export function getConfigJsPath(): string {
  // Do not create automatically
  return path.join(getDwarfGlobalPath(), "out", "config.js");
}

export function getTsConfigPath(): string {
  const tsConfigPath = path.join(getDwarfGlobalPath(), "tsconfig.json");
  if (!fs.existsSync(tsConfigPath)) {
    fs.writeFileSync(
      tsConfigPath,
      JSON.stringify(
        {
          compilerOptions: {
            target: "ESNext",
            useDefineForClassFields: true,
            lib: ["DOM", "DOM.Iterable", "ESNext"],
            allowJs: true,
            skipLibCheck: true,
            esModuleInterop: false,
            allowSyntheticDefaultImports: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            module: "System",
            moduleResolution: "Node",
            noEmit: false,
            noEmitOnError: false,
            outFile: "./out/config.js",
            typeRoots: ["./node_modules/@types", "./types"],
          },
          include: ["./config.ts"],
        },
        null,
        2,
      ),
    );
  }
  return tsConfigPath;
}

export function getDwarfRcPath(): string {
  // Disable indexing of the config folder to prevent infinite loops
  const dwarfrcPath = path.join(getDwarfGlobalPath(), ".dwarfrc.json");
  if (!fs.existsSync(dwarfrcPath)) {
    fs.writeFileSync(
      dwarfrcPath,
      JSON.stringify(
        {
          disableIndexing: true,
        },
        null,
        2,
      ),
    );
  }
  return dwarfrcPath;
}

function editConfigJson(
  callback: (config: SerializedDwarfConfig) => SerializedDwarfConfig,
): void {
  const config = fs.readFileSync(getConfigJsonPath(), "utf8");
  let configJson = JSONC.parse(config);
  // Check if it's an object
  if (typeof configJson === "object" && configJson !== null) {
    configJson = callback(configJson as any) as any;
    fs.writeFileSync(getConfigJsonPath(), JSONC.stringify(configJson, null, 2));
  } else {
    console.warn("config.json is not a valid object");
  }
}

function editConfigYaml(callback: (config: ConfigYaml) => ConfigYaml): void {
  const configPath = getConfigYamlPath();
  const config = fs.readFileSync(configPath, "utf8");
  let configYaml = YAML.parse(config);
  // Check if it's an object
  if (typeof configYaml === "object" && configYaml !== null) {
    configYaml = callback(configYaml as any) as any;
    fs.writeFileSync(configPath, YAML.stringify(configYaml));
    setConfigFilePermissions(configPath);
  } else {
    console.warn("config.yaml is not a valid object");
  }
}

export function editConfigFile(
  configJsonCallback: (config: SerializedDwarfConfig) => SerializedDwarfConfig,
  configYamlCallback: (config: ConfigYaml) => ConfigYaml,
): void {
  if (fs.existsSync(getConfigYamlPath())) {
    editConfigYaml(configYamlCallback);
  } else if (fs.existsSync(getConfigJsonPath())) {
    editConfigJson(configJsonCallback);
  }
}

function getMigrationsFolderPath(): string {
  const migrationsPath = path.join(getDwarfGlobalPath(), ".migrations");
  if (!fs.existsSync(migrationsPath)) {
    fs.mkdirSync(migrationsPath);
  }
  return migrationsPath;
}

export async function migrate(
  id: string,
  callback: () => void | Promise<void>,
  onAlreadyComplete?: () => void,
) {
  if (process.env.NODE_ENV === "test") {
    return await Promise.resolve(callback());
  }

  const migrationsPath = getMigrationsFolderPath();
  const migrationPath = path.join(migrationsPath, id);

  if (!fs.existsSync(migrationPath)) {
    try {
      console.log(`Running migration: ${id}`);

      fs.writeFileSync(migrationPath, "");
      await Promise.resolve(callback());
    } catch (e) {
      console.warn(`Migration ${id} failed`, e);
    }
  } else if (onAlreadyComplete) {
    onAlreadyComplete();
  }
}

export function getIndexSqlitePath(): string {
  return path.join(getIndexFolderPath(), "index.sqlite");
}

export function getLanceDbPath(): string {
  return path.join(getIndexFolderPath(), "lancedb");
}

export function getTabAutocompleteCacheSqlitePath(): string {
  return path.join(getIndexFolderPath(), "autocompleteCache.sqlite");
}

export function getDocsSqlitePath(): string {
  return path.join(getIndexFolderPath(), "docs.sqlite");
}

export function getDwarfDotEnv(): { [key: string]: string } {
  const filepath = path.join(getDwarfGlobalPath(), ".env");
  if (fs.existsSync(filepath)) {
    return dotenv.parse(fs.readFileSync(filepath));
  }
  return {};
}

export function getLogsDirPath(): string {
  const logsPath = path.join(getDwarfGlobalPath(), "logs");
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath);
  }
  return logsPath;
}

export function getCoreLogsPath(): string {
  return path.join(getLogsDirPath(), "core.log");
}

export function getPromptLogsPath(): string {
  return path.join(getLogsDirPath(), "prompt.log");
}

export function getGlobalFolderWithName(name: string): string {
  return path.join(getDwarfGlobalPath(), name);
}

export function getGlobalPromptsPath(): string {
  return getGlobalFolderWithName("prompts");
}

export function readAllGlobalPromptFiles(
  folderPath: string = getGlobalPromptsPath(),
): { path: string; content: string }[] {
  if (!fs.existsSync(folderPath)) {
    return [];
  }
  const files = fs.readdirSync(folderPath);
  const promptFiles: { path: string; content: string }[] = [];
  files.forEach((file) => {
    const filepath = path.join(folderPath, file);
    const stats = fs.statSync(filepath);

    if (stats.isDirectory()) {
      const nestedPromptFiles = readAllGlobalPromptFiles(filepath);
      promptFiles.push(...nestedPromptFiles);
    } else if (file.endsWith(".prompt")) {
      const content = fs.readFileSync(filepath, "utf8");
      promptFiles.push({ path: filepath, content });
    }
  });

  return promptFiles;
}

export function getRepoMapFilePath(): string {
  return path.join(getDwarfUtilsPath(), "repo_map.txt");
}

export function getEsbuildBinaryPath(): string {
  return path.join(getDwarfUtilsPath(), "esbuild");
}

export function getLocalEnvironmentDotFilePath(): string {
  return path.join(getDwarfGlobalPath(), ".local");
}

export function getStagingEnvironmentDotFilePath(): string {
  return path.join(getDwarfGlobalPath(), ".staging");
}

export function getDiffsDirectoryPath(): string {
  const diffsPath = path.join(getDwarfGlobalPath(), ".diffs"); // .replace(/^C:/, "c:"); ??
  if (!fs.existsSync(diffsPath)) {
    fs.mkdirSync(diffsPath, {
      recursive: true,
    });
  }
  return diffsPath;
}

export const isFileWithinFolder = (
  fileUri: string,
  folderPath: string,
): boolean => {
  try {
    if (!fileUri || !folderPath) {
      return false;
    }

    const fileUriParsed = URI.parse(fileUri);
    const fileScheme = fileUriParsed.scheme || "file";
    let filePath = fileUriParsed.path || "";
    filePath = decodeURIComponent(filePath);

    let folderWithScheme = folderPath;
    if (!folderPath.includes("://")) {
      folderWithScheme = `${fileScheme}://${folderPath.startsWith("/") ? "" : "/"}${folderPath}`;
    }
    const folderUriParsed = URI.parse(folderWithScheme);

    let folderPathClean = folderUriParsed.path || "";
    folderPathClean = decodeURIComponent(folderPathClean);

    filePath = filePath.replace(/\/$/, "");
    folderPathClean = folderPathClean.replace(/\/$/, "");

    return (
      filePath === folderPathClean || filePath.startsWith(`${folderPathClean}/`)
    );
  } catch (error) {
    console.error("Error in isFileWithinFolder:", error);
    return false;
  }
};
