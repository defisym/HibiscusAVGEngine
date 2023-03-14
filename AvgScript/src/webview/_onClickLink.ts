import * as vscode from 'vscode';
import { jumpToDocument } from '../lib/utilities';

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

        jumpToDocument(uri, line);
    }
}