import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';

let activeProcess: ChildProcess | null = null;

const PRESETS: Record<string, string> = {
    'Glass': '/System/Library/Sounds/Glass.aiff',
    'Hero': '/System/Library/Sounds/Hero.aiff',
    'Ping': '/System/Library/Sounds/Ping.aiff',
    'Submarine': '/System/Library/Sounds/Submarine.aiff',
    'Funk': '/System/Library/Sounds/Funk.aiff',
    'Morse': '/System/Library/Sounds/Morse.aiff',
    'Tink': '/System/Library/Sounds/Tink.aiff',
    'Sosumi': '/System/Library/Sounds/Sosumi.aiff'
};

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('agentAlert.playSound', () => {
        const config = getEffectiveConfig();
        playSound(config.soundPath, config.duration);
    });
    context.subscriptions.push(disposable);

    vscode.tasks.onDidEndTask(() => {
        const config = getEffectiveConfig();
        playSound(config.soundPath, config.duration);
    });

    let generationTimer: NodeJS.Timeout | null = null;
    vscode.workspace.onDidChangeTextDocument((e) => {
        const config = getEffectiveConfig();
        const totalAdded = e.contentChanges.reduce((sum, change) => sum + change.text.length, 0);

        if (totalAdded > 50) {
            if (generationTimer) clearTimeout(generationTimer);

            generationTimer = setTimeout(() => {
                playSound(config.soundPath, config.duration);
                generationTimer = null;
            }, config.timeout);
        }
    });
}

function getEffectiveConfig() {
    const config = vscode.workspace.getConfiguration('agentAlert');
    const timeout = config.get<number>('heuristicTimeout', 2500);
    const preset = config.get<string>('presetSound', 'Glass');
    const customPath = config.get<string>('customSoundPath', '');
    const duration = config.get<number>('playbackDuration', 0);

    const soundPath = preset === 'None (Use Custom Path)' ? customPath : preset;
    return { timeout, soundPath, duration };
}

function playSound(customPath?: string, durationMs?: number) {
    let filePath: string = customPath || PRESETS['Glass'];
    if (!filePath) return;

    if (PRESETS[filePath]) filePath = PRESETS[filePath];

    if (activeProcess) {
        activeProcess.kill();
        activeProcess = null;
    }

    try {
        const args = [filePath];
        if (durationMs && durationMs > 0) {
            args.push('-t', (durationMs / 1000).toString());
        }

        const cp = spawn('afplay', args);
        activeProcess = cp;

        // Fallback safety kill in case -t doesn't work for some reason
        if (durationMs && durationMs > 0) {
            setTimeout(() => {
                if (activeProcess === cp) {
                    cp.kill();
                    activeProcess = null;
                }
            }, durationMs + 100); // 100ms buffer after afplay should have ended itself
        }
    } catch (err) {
        console.error('Failed to play sound:', err);
    }
}

export function deactivate() {
    if (activeProcess) activeProcess.kill();
}
