/* eslint-disable @typescript-eslint/naming-convention */

import { NodeInfo } from "../functions/command";

// https://mermaid.js.org/config/usage.html

const chartTemplate = `graph LR
                        A --- B
                        B-->C[fa:fa-ban forbidden]
                        B-->D(fa:fa-spinner);`;

export function jumpFlow_getWebviewContent(jumpTable: [NodeInfo, number][]) {
    const pageTemplate = `<!DOCTYPE html>

                        <head>
                            <meta charset="utf-8" />
                        </head>
                        
                        <body>
                            <pre class="mermaid">
                            {$GRAPH}
                            </pre>
                            <script type="module">
                                import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.esm.min.mjs';
                                mermaid.initialize({ startOnLoad: true });
                            </script>
                        </body>
                        
                        </html>`;

    let chart = chartTemplate;

    let page = pageTemplate.replace('{$GRAPH}', chart);

    return page;
}