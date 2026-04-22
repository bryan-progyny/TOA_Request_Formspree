import fs from 'fs';

const filePath = 'src/components/ProspectForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Before fixes - searching for backspace character pattern');

// The pattern is: className={ [BACKSPACE] order p-0 }>
// We need to replace the entire thing

// Replace className={ [BACKSPACE] with proper template
content = content.replace(
  /className=\{\x08/g,
  "className={`"
);

// Now replace  order p-0 }> at the end of table cells with proper closing
// But we need to be more careful. Let me do multiple passes

// First, let's look for and fix the table cell pattern
content = content.replace(
  /className=\{`order p-0 \}>/g,
  "className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>"
);

// Fix the input field className pattern (className=\{ [BACKSPACE] w-full...)
// These don't have closing } at end of line, so they're incomplete
content = content.replace(
  /className=\{\x08w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none \}/g,
  "className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}"
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed ProspectForm.tsx - removed backspace characters and added proper templates');
