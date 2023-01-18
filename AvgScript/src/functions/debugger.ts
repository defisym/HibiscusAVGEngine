import * as vscode from 'vscode';

import { commandBasePath } from './command';
import { execPath, updateBasePath } from './file';

class AvgScriptDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined
        , config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'AvgScript') {
            config.name = 'Hibiscus';
            config.type = 'AvgScript';
            config.request = 'launch';
            config.script = editor.document.fileName;

            return config;
        }

        return vscode.window.showErrorMessage("Invalid AvgScript File").then(_ => {
            return undefined;	// abort launch
        });
    }
}

class AvgScriptDebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(_session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        // update basePath
        if (!updateBasePath()) {
            vscode.commands.executeCommand(commandBasePath);
        }

        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'AvgScript') {
            const command = execPath;
            const args = [editor.document.fileName];

            executable = new vscode.DebugAdapterExecutable(command, args);

            // make VS Code launch the DA executable
            return executable;
        }

        return vscode.window.showErrorMessage("Invalid AvgScript File").then(_ => {
            return undefined;	// abort launch
        });
    }
}

export const debuggerProvider = vscode.debug.registerDebugConfigurationProvider("AvgScript", new AvgScriptDebugConfigurationProvider());
export const debuggerFactory = vscode.debug.registerDebugAdapterDescriptorFactory("AvgScript", new AvgScriptDebugAdapterExecutableFactory());