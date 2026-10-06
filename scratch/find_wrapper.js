const http = require('http');

http.get('http://localhost:8080/', (res) => {
    let html = '';
    res.on('data', (chunk) => html += chunk);
    res.on('end', () => {
        const regex = /<(\/)?([a-zA-Z0-9:-]+)(?:\s+([^>]*))?>/g;
        let match;
        const stack = [];
        const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'noscript', 'wbr']);
        
        const targetText = "Chưa Có Bài Viết Nào Được Đăng";
        const targetIndex = html.indexOf(targetText);
        
        if (targetIndex === -1) {
            console.log("Could not find target text in HTML!");
            process.exit(1);
        }
        
        while ((match = regex.exec(html)) !== null) {
            const isClosing = !!match[1];
            const tagName = match[2].toLowerCase();
            const attrs = match[3] || '';
            const isSelfClosing = attrs.endsWith('/') || selfClosing.has(tagName);
            
            if (match.index > targetIndex) {
                break;
            }
            
            if (isSelfClosing) continue;
            
            if (isClosing) {
                if (stack.length > 0) {
                    stack.pop();
                }
            } else {
                stack.push({ name: tagName, index: match.index, attrs: attrs.trim() });
            }
        }
        
        console.log("Tags wrapping the target text:");
        stack.forEach((item, idx) => {
            console.log(`  [${idx}] ${item.name} (attrs: ${item.attrs})`);
        });
    });
});
