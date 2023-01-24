import marked = require('marked');

export function markdownParser(markdown: string) {
    return marked.marked.parse(markdown);
}
