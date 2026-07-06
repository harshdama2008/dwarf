import { getDwarfRcPath, getTsConfigPath } from "core/util/paths";
import * as vscode from "vscode";

import { VsCodeExtension } from "../extension/VsCodeExtension";
import { isUnsupportedPlatform } from "../util/util";

import { GlobalContext } from "core/util/GlobalContext";
import { VsCodeDwarfApi } from "./api";
import setupInlineTips from "./InlineTipManager";

export async function activateExtension(context: vscode.ExtensionContext) {
  const platformCheck = isUnsupportedPlatform();
  const globalContext = new GlobalContext();
  const hasShownUnsupportedPlatformWarning = globalContext.get(
    "hasShownUnsupportedPlatformWarning",
  );

  if (platformCheck.isUnsupported && !hasShownUnsupportedPlatformWarning) {
    const platformTarget = "windows-arm64";

    globalContext.update("hasShownUnsupportedPlatformWarning", true);
    void vscode.window.showInformationMessage(
      `Dwarf detected that you are using ${platformTarget}. Due to native dependencies, Dwarf may not be able to start`,
    );
  }

  // Add necessary files
  getTsConfigPath();
  getDwarfRcPath();

  // Register commands and providers
  setupInlineTips(context);

  const vscodeExtension = new VsCodeExtension(context);

  // Load Dwarf configuration
  if (!context.globalState.get("hasBeenInstalled")) {
    void context.globalState.update("hasBeenInstalled", true);
  }

  // Register config.yaml schema by removing old entries and adding new one (uri.fsPath changes with each version)
  const yamlMatcher = ".dwarf/**/*.yaml";
  const yamlConfig = vscode.workspace.getConfiguration("yaml");
  const yamlSchemas = yamlConfig.get<object>("schemas", {});

  const newPath = vscode.Uri.joinPath(
    context.extension.extensionUri,
    "config-yaml-schema.json",
  ).toString();

  try {
    await yamlConfig.update(
      "schemas",
      {
        ...yamlSchemas,
        [newPath]: [yamlMatcher],
      },
      vscode.ConfigurationTarget.Global,
    );
  } catch (error) {
    console.error(
      "Failed to register Dwarf config.yaml schema, most likely, YAML extension is not installed",
      error,
    );
  }

  const api = new VsCodeDwarfApi(vscodeExtension);
  const continuePublicApi = {
    registerCustomContextProvider: api.registerCustomContextProvider.bind(api),
  };

  // 'export' public api-surface
  // or entire extension for testing
  return process.env.NODE_ENV === "test"
    ? {
        ...continuePublicApi,
        extension: vscodeExtension,
      }
    : continuePublicApi;
}
