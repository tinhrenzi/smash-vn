const fs = require('fs');
const html = fs.readFileSync('src/main/resources/templates/admin/donhang-list.html', 'utf8');

const htmlLines = html.split('\n');

let insideScript = false;
let scriptContent = '';
let startLine = 0;

for (let i = 0; i < htmlLines.length; i++) {
    const line = htmlLines[i];
    if (line.includes('<script') && !line.includes('src=')) {
        insideScript = true;
        scriptContent = '';
        startLine = i + 1;
        continue;
    }
    if (line.includes('</script>') && insideScript) {
        insideScript = false;
        try {
            new Function(scriptContent);
            console.log(`Script starting at line ${startLine} is valid.`);
        } catch (e) {
            console.error(`Script starting at line ${startLine} syntax error:`, e.message);
            // Locate breaking line
            let accum = '';
            const scriptLines = scriptContent.split('\n');
            for (let j = 0; j < scriptLines.length; j++) {
                accum += scriptLines[j] + '\n';
                try {
                    new Function(accum);
                } catch (err) {
                    if (err.message !== e.message) {
                        console.log(`First break at line ${startLine + j}: ${err.message}`);
                    }
                }
            }
        }
    }
    if (insideScript) {
        scriptContent += line + '\n';
    }
}
