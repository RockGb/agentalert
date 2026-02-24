# Agent Alert 🎵

An auditory notification system for AI-assisted coding.

## How it works
**Agent Alert** is a standalone VS Code extension that monitors your environment (Terminal, Tasks, and AI generation heuristics) and plays a sound directly from your computer when an activity finishes.

No external server or setup is required!

## Installation
The easiest way to get started is to install the extension directly from the VS Code Marketplace:

👉 [**Install Agent Alert**](https://marketplace.visualstudio.com/items?itemName=OmogbolahanApata.agent-alert)

## Features
- **AI Generation Detection**: Heuristic-based detection of large text insertions.
- **Sound Presets**: Built-in access to classic macOS system sounds (Glass, Hero, Ping, etc.).
- **Custom Sounds**: Use any local `.aiff`, `.mp3`, or `.wav` file.
- **Adjustable Duration**: Control exactly how long the alert plays.

## Development
If you want to build the extension from source:

1. Clone the repo: `git clone https://github.com/RockGb/agentalert.git`
2. Install dependencies: `npm install`
3. Open `plugins/vscode` and run the "VS Code Extension" launch configuration.

## License
MIT
