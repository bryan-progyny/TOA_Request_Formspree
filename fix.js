const fs = require('fs');

const filePath = 'src/components/ProspectForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix broken className attributes
// Pattern 1: className={order p-0 }> with proper template
content = content.replace(
  /className=\{order p-0 \}>/g,
  "className={`border p-0 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-300 bg-transparent'}`}>"
);

// Pattern 2: className={w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none }
content = content.replace(
  /className=\{w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none \}/g,
  "className={`w-full px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-900'}`}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed ProspectForm.tsx');
