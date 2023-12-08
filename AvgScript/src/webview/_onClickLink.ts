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
		let link: string = message.link;

		const idx = link.lastIndexOf('#');
		const bNoLineInfo = idx === -1;

		const line = !bNoLineInfo
			? parseInt(link.substring(idx + 1))
			: NaN;
		const uri = vscode.Uri.parse(!bNoLineInfo
			? link.substring(0, idx)
			: link);

		jumpToDocument(uri, line);
	}
}