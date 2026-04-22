import fs from 'fs';

const filePath = 'src/components/ProspectForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const line820 = lines[820];

console.log('Line 820 length:', line820.length);
console.log('Line 820:', line820);

// Print each character
for (let i = 0; i < Math.min(60, line820.length); i++) {
  console.log(`Char ${i}: '${line820[i]}' (code ${line820.charCodeAt(i)})`);
}

// Find the className= part
const classNameIdx = line820.indexOf('className=');
if (classNameIdx >=0) {
  const fromClassNames = line820.substring(classNameIdx, classNameIdx + 50);
  console.log('\nFrom className=:', fromClassNames);
  for (let i = 0; i < Math.min(50, fromClassNames.length); i++) {
    console.log(`  Char ${i}: '${fromClassNames[i]}' (code ${fromClassNames.charCodeAt(i)})`);
  }
}
