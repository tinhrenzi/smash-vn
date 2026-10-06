const fs = require('fs');
const html = fs.readFileSync('scratch/rendered-donhang.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const jsCode = match[1];
    if (!jsCode.trim()) continue;
    try {
        new Function(jsCode);
        console.log(`Rendered script block #${count} is VALID.`);
    } catch (e) {
        console.error(`Rendered script block #${count} INVALID:`, e.message);
        fs.writeFileSync(`scratch/bad-script-${count}.js`, jsCode, 'utf8');
        console.log(`Saved invalid script to scratch/bad-script-${count}.js`);
    }
}
