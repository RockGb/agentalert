import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';

let activeProcess: ChildProcess | null = null;

const IS_WINDOWS = process.platform === 'win32';

const PRESETS: Record<string, string> = IS_WINDOWS ? {
    'Tada': 'C:\\Windows\\Media\\tada.wav',
    'Chimes': 'C:\\Windows\\Media\\chimes.wav',
    'Ding': 'C:\\Windows\\Media\\ding.wav',
    'Notify': 'C:\\Windows\\Media\\notify.wav',
    'Ringout': 'C:\\Windows\\Media\\ringout.wav',
    'Speech On': 'C:\\Windows\\Media\\Speech On.wav',
    'Speech Off': 'C:\\Windows\\Media\\Speech Off.wav'
} : {
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
    const preset = config.get<string>('presetSound', IS_WINDOWS ? 'Tada' : 'Glass');
    const customPath = config.get<string>('customSoundPath', '');
    const duration = config.get<number>('playbackDuration', 0);

    const soundPath = preset === 'None (Use Custom Path)' ? customPath : (PRESETS[preset] || (IS_WINDOWS ? PRESETS['Tada'] : PRESETS['Glass']));
    return { timeout, soundPath, duration };
}

function playSound(filePath: string, durationMs?: number) {
    if (!filePath) return;

    if (activeProcess) {
        activeProcess.kill();
        activeProcess = null;
    }

    try {
        let cp: ChildProcess;

        if (IS_WINDOWS) {
            // PowerShell command to play sound
            const psCommand = `(New-Object Media.SoundPlayer "${filePath}").PlaySync();`;
            cp = spawn('powershell', ['-Command', psCommand]);
        } else {
            // macOS afplay command
            const args = [filePath];
            if (durationMs && durationMs > 0) {
                args.push('-t', (durationMs / 1000).toString());
            }
            cp = spawn('afplay', args);
        }

        activeProcess = cp;

        if (durationMs && durationMs > 0) {
            setTimeout(() => {
                if (activeProcess === cp) {
                    cp.kill();
                    activeProcess = null;
                }
            }, durationMs + 100);
        }
    } catch (err) {
        console.error('Failed to play sound:', err);
    }
}

export function deactivate() {
    if (activeProcess) activeProcess.kill();
}
