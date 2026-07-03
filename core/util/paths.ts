import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as URI from "uri-js";
import * as YAML from "yaml";

import { ConfigYaml } from "@mangodev/config-yaml";
import * as JSONC from "comment-json";
import dotenv from "dotenv";

import { IdeType, SerializedMangoConfig } from "../";
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

const MANGO_GLOBAL_DIR = (() => {
  const configPath = process.env.MANGO_GLOBAL_DIR;
  if (configPath) {
    // Convert relative path to absolute paths based on current working directory
    return path.isAbsolute(configPath)
      ? configPath
      : path.resolve(process.cwd(), configPath);
  }
  return path.join(os.homedir(), ".mango");
})();

// export const DEFAULT_CONFIG_TS_CONTENTS = `import { Config } from "./types"\n\nexport function modifyConfig(config: Config): Config {
//   return config;
// }`;

export const DEFAULT_CONFIG_TS_CONTENTS = `export function modifyConfig(config: Config): Config {
  return config;
}`;

export function getChromiumPath(): string {
  return path.join(getMangoUtilsPath(), ".chromium-browser-snapshots");
}

export function getMangoUtilsPath(): string {
  const utilsPath = path.join(getMangoGlobalPath(), ".utils");
  if (!fs.existsSync(utilsPath)) {
    fs.mkdirSync(utilsPath);
  }
  return utilsPath;
}

export function getGlobalMangoIgnorePath(): string {
  const mangoIgnorePath = path.join(getMangoGlobalPath(), ".mangoignore");
  if (!fs.existsSync(mangoIgnorePath)) {
    fs.writeFileSync(mangoIgnorePath, "");
  }
  return mangoIgnorePath;
}

export function getMangoGlobalPath(): string {
  // This is ~/.mango on mac/linux
  const mangoPath = MANGO_GLOBAL_DIR;
  if (!fs.existsSync(mangoPath)) {
    fs.mkdirSync(mangoPath);
  }
  return mangoPath;
}

export function getSessionsFolderPath(): string {
  const sessionsPath = path.join(getMangoGlobalPath(), "sessions");
  if (!fs.existsSync(sessionsPath)) {
    fs.mkdirSync(sessionsPath);
  }
  return sessionsPath;
}

export function getIndexFolderPath(): string {
  const indexPath = path.join(getMangoGlobalPath(), "index");
  if (!fs.existsSync(indexPath)) {
    fs.mkdirSync(indexPath);
  }
  return indexPath;
}

export function getGlobalContextFilePath(): string {
  return path.join(getIndexFolderPath(), "globalContext.json");
}

export function getSharedConfigFilePath(): string {
  return path.join(getMangoGlobalPath(), "sharedConfig.json");
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
  const p = path.join(getMangoGlobalPath(), "config.json");
  return p;
}

export function getConfigYamlPath(ideType?: IdeType): string {
  const p = path.join(getMangoGlobalPath(), "config.yaml");
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
  const p = path.join(getMangoGlobalPath(), "config.ts");
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, DEFAULT_CONFIG_TS_CONTENTS);
  }

  const typesPath = path.join(getMangoGlobalPath(), "types");
  if (!fs.existsSync(typesPath)) {
    fs.mkdirSync(typesPath);
  }
  const corePath = path.join(typesPath, "core");
  if (!fs.existsSync(corePath)) {
    fs.mkdirSync(corePath);
  }
  const packageJsonPath = path.join(getMangoGlobalPath(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify({
        name: "mango-config",
        version: "1.0.0",
        description: "My Mango Configuration",
        main: "config.js",
      }),
    );
  }

  fs.writeFileSync(path.join(corePath, "index.d.ts"), Types);
  return p;
}

export function getConfigJsPath(): string {
  // Do not create automatically
  return path.join(getMangoGlobalPath(), "out", "config.js");
}

export function getTsConfigPath(): string {
  const tsConfigPath = path.join(getMangoGlobalPath(), "tsconfig.json");
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

export function getMangoRcPath(): string {
  // Disable indexing of the config folder to prevent infinite loops
  const mangorcPath = path.join(getMangoGlobalPath(), ".mangorc.json");
  if (!fs.existsSync(mangorcPath)) {
    fs.writeFileSync(
      mangorcPath,
      JSON.stringify(
        {
          disableIndexing: true,
        },
        null,
        2,
      ),
    );
  }
  return mangorcPath;
}

function editConfigJson(
  callback: (config: SerializedMangoConfig) => SerializedMangoConfig,
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
  configJsonCallback: (config: SerializedMangoConfig) => SerializedMangoConfig,
  configYamlCallback: (config: ConfigYaml) => ConfigYaml,
): void {
  if (fs.existsSync(getConfigYamlPath())) {
    editConfigYaml(configYamlCallback);
  } else if (fs.existsSync(getConfigJsonPath())) {
    editConfigJson(configJsonCallback);
  }
}

function getMigrationsFolderPath(): string {
  const migrationsPath = path.join(getMangoGlobalPath(), ".migrations");
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

export function getMangoDotEnv(): { [key: string]: string } {
  const filepath = path.join(getMangoGlobalPath(), ".env");
  if (fs.existsSync(filepath)) {
    return dotenv.parse(fs.readFileSync(filepath));
  }
  return {};
}

export function getLogsDirPath(): string {
  const logsPath = path.join(getMangoGlobalPath(), "logs");
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
  return path.join(getMangoGlobalPath(), name);
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
  return path.join(getMangoUtilsPath(), "repo_map.txt");
}

export function getEsbuildBinaryPath(): string {
  return path.join(getMangoUtilsPath(), "esbuild");
}

export function getLocalEnvironmentDotFilePath(): string {
  return path.join(getMangoGlobalPath(), ".local");
}

export function getStagingEnvironmentDotFilePath(): string {
  return path.join(getMangoGlobalPath(), ".staging");
}

export function getDiffsDirectoryPath(): string {
  const diffsPath = path.join(getMangoGlobalPath(), ".diffs"); // .replace(/^C:/, "c:"); ??
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
