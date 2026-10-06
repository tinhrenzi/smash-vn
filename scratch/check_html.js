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
                if (stack.length === 0) {
                    console.log(`Extra closing tag </${tagName}> at index ${match.index}`);
                    continue;
                }
                const last = stack.pop();
                if (last.name !== tagName) {
                    console.log(`Mismatch: Expected </${last.name}> (opened at ${last.index} with attrs: ${last.attrs}) but found </${tagName}> at ${match.index}`);
                    console.log("Current Stack (top of stack is last):");
                    stack.forEach((item, idx) => {
                        console.log(`  [${idx}] ${item.name} (opened at ${item.index}, attrs: ${item.attrs})`);
                    });
                    process.exit(1);
                }
            } else {
                stack.push({ name: tagName, index: match.index, attrs: attrs.trim() });
            }
        }
    });
});
