import * as vscode from 'vscode';

export const onClickLinkScript = `
<script>
    const vscode = acquireVsCodeApi();

    for (const link of document.querySelectorAll('a[href^="file:"]')) {
        link.addEventListener('click', () => {
            vscode.postMessage({
                command: "open",
                link: link.getAttribute('href'),
            });
        });
    }
</script>
`;

export async function handleOnClickLink(message: any) {
    if (message.command === "open") {
        const uri = vscode.Uri.parse(message.link);
        const line = parseInt(uri.fragment);

        if (Number.isNaN(line)) {
            const editor = await vscode.window.showTextDocument(uri
                , {
                    viewColumn: vscode.ViewColumn.Beside
                });
            editor.revealRange(new vscode.Range(0, 0, 0, 0)
                , vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }

        const doc = await vscode.workspace.openTextDocument(uri);
        const text = doc.lineAt(line).text;

        const range = new vscode.Range(line, 0
            , line, text.length);
        const selection = new vscode.Selection(line, 0
            , line, text.length);

        const editor = await vscode.window.showTextDocument(uri, {
            viewColumn: vscode.ViewColumn.Beside,
            // viewColumn: vscode.window.activeTextEditor === undefined || vscode.window.activeTextEditor.viewColumn === undefined
            //     ? vscode.ViewColumn.Beside
            //     : vscode.window.activeTextEditor.viewColumn + 1,
            selection: selection,
        });

        editor.revealRange(range
            , vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
}