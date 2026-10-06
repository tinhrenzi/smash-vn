const http = require('http');

http.get('http://localhost:8080/', (res) => {
    let html = '';
    res.on('data', (chunk) => html += chunk);
    res.on('end', () => {
        const regex = /<(\/)?([a-zA-Z0-9:-]+)(?:\s+([^>]*))?>/g;
        let match;
        const stack = [];
        const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'noscript', 'wbr']);
        
        while ((match = regex.exec(html)) !== null) {
            const isClosing = !!match[1];
            const tagName = match[2].toLowerCase();
            const attrs = match[3] || '';
            const isSelfClosing = attrs.endsWith('/') || selfClosing.has(tagName);
            
            if (isSelfClosing) continue;
            
            if (isClosing) {
                if (stack.length === 0) continue;
                const last = stack.pop();
                if (last.name === 'div' && last.attrs.includes('id="app"')) {
                    console.log(`div#app (opened at index ${last.index}) was closed at index ${match.index}!`);
                    console.log(`Snippet around close: "${html.substring(match.index - 100, match.index + 100).replace(/\n/g, ' ')}"`);
                    process.exit(0);
                }
            } else {
                stack.push({ name: tagName, index: match.index, attrs: attrs.trim() });
            }
        }
        console.log("div#app was never closed!");
    });
});
