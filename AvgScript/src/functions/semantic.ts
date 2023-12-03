import * as vscode from 'vscode';
import { lineCommentCache } from '../lib/comment';

class SemanticProvider implements vscode.DocumentRangeSemanticTokensProvider {
	provideDocumentRangeSemanticTokens(document: vscode.TextDocument, range: vscode.Range, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
		const builder = new vscode.SemanticTokensBuilder();
		const curCache = lineCommentCache.getDocumentCache(document);

		for (let line = range.start.line; line < range.end.line; line++) {
			const lineInfo = curCache.lineInfo[line];

			if (lineInfo.emptyLine) { continue; }

			const textLine = document.lineAt(line);

			// line has comment
			if (lineInfo.originText.length !== lineInfo.textNoComment.length) {
				if (lineInfo.lineIsComment) {
					// builder.push(line, 0,0,)

					continue;
				}
			}
		}

		return builder.build();
	}
}

const semanticProviderClass = new SemanticProvider();

const legend = new vscode.SemanticTokensLegend(
	['comments', 'labels', 'operators', 'params', 'numbers_dec', 'numbers_hex', 'keywords_region', 'keywords_system', 'keywords_values', 'keywords_dialogue', 'keywords_media', 'keywords_effect', 'keywords_preobj', 'dialogue_name', 'dialogue_dialogue', 'language_prefix', 'language_region']
);

export const semanticProvider = vscode.languages.registerDocumentRangeSemanticTokensProvider('AvgScript', semanticProviderClass, legend);