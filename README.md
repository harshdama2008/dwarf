<h1 align="center">Mango</h1>

<p align="center">Free, open-source AI coding assistant built around token efficiency</p>

<div align="center">

<a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" /></a>
<a href="https://github.com/harshdama2008/mango"><img src="https://img.shields.io/badge/View_source-181717?logo=github&logoColor=white" /></a>

</div>

<p align="center">
  <img src="extensions/vscode/media/readme.png" alt="Banner" />
</p>

## What is Mango?

Mango is a personal fork of [Continue.dev](https://github.com/continuedev/continue), the open-source AI coding agent. It exists because Continue.dev and Void — the two main open-source AI coding assistants — both shut down in 2026, leaving a gap for a coding assistant that doesn't require an account, a subscription, or a hosted backend.

Mango is a VS Code extension providing local chat, autocomplete, and agent mode. You bring your own API key (or point it at a local model), and everything runs from your machine. There is no login, no telemetry, no remote Hub, and no team/organization features — this fork deliberately strips all of that out in favor of a small, self-contained extension.

## Installation

Mango isn't published to the VS Code Marketplace. To install it, build the extension from source:

```sh
git clone https://github.com/harshdama2008/mango.git
cd mango/extensions/vscode
npm install
npm run package
```

This produces a `.vsix` file you can install with:

```sh
code --install-extension <path-to-vsix>
```

See [`extensions/vscode/CONTRIBUTING.md`](extensions/vscode/CONTRIBUTING.md) for running the extension in development mode instead.

## Configuration

Mango is configured entirely locally via `config.yaml` (or the legacy `config.json`) in your `~/.mango` directory — there is no remote config or account sync. See the in-editor config UI or your existing Continue configuration for the schema; Mango uses the same `config.yaml`/`config.json` format as upstream Continue.

## License

Apache 2.0 © 2023-2026 Continue Dev, Inc.
