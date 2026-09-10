const fs = require('fs');

const path = require('path');
const logPath = 'C:\\Users\\Asus\\.gemini\\antigravity-ide\\brain\\082a454b-1649-4b0a-bd14-1f5c9ca4ec76\\.system_generated\\logs\\transcript_full.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);

let originalCode = null;

for (let i = lines.length - 1; i >= 0; i--) {
  const line = JSON.parse(lines[i]);
  
  if (line.type === 'PLANNER_RESPONSE' && line.tool_calls) {
    for (const tc of line.tool_calls) {
      if (tc.name === 'replace_file_content' && tc.args.TargetFile.includes('Customers.jsx')) {
        originalCode = tc.args.TargetContent;
      }
    }
  }
  
  if (originalCode) break;
}

if (originalCode) {
  fs.writeFileSync('C:\\MyProjects\\shree-shyam-rasoi\\src\\pages\\customers\\Customers_backup.txt', originalCode, 'utf8');
  console.log('Original code found and saved to Customers_backup.txt');
} else {
  console.log('Original code not found.');
}
