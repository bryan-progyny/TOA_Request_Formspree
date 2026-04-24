/**
 * PowerPoint template generator
 * Loads template from public folder and replaces placeholders with form data
 */

import PizZip from 'pizzip';

export interface PPTXData {
  client: string;
}

/**
 * Ultra-aggressive replacement that handles extreme XML fragmentation
 * Allows any XML tags/whitespace between each character of the placeholder
 */
function replaceFragmentedText(xml: string, placeholder: string, value: string): string {
  // Build regex that matches placeholder with ANY XML between each character
  // Example: [Client] becomes: \[\s*(?:<[^>]*>)*C\s*(?:<[^>]*>)*l\s*(?:<[^>]*>)*i...
  
  const chars = placeholder.split('');
  const pattern = chars.map(char => {
    const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped + '(?:\\s*<[^>]*>\\s*)*';
  }).join('');
  
  const regex = new RegExp(pattern, 'gi');
  
  // Find all matches
  const matches: Array<{ match: string; index: number }> = [];
  let match;
  regex.lastIndex = 0;
  while ((match = regex.exec(xml)) !== null) {
    matches.push({ match: match[0], index: match.index });
    console.log(`Found fragmented "${placeholder}" at position ${match.index}`);
  }
  
  if (matches.length === 0) {
    return xml;
  }
  
  // Replace in reverse order to preserve indices
  let result = xml;
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    // Keep the first opening tag if present
    const before = result.substring(0, m.index);
    const after = result.substring(m.index + m.match.length);
    
    // Wrap replacement in a:t tags
    const replacement = `<a:t>${value}</a:t>`;
    result = before + replacement + after;
  }
  
  return result;
}

export async function generatePPTX(data: PPTXData): Promise<void> {
  try {
    console.log('=== PowerPoint Generation Started ===');
    console.log('Client name:', data.client);
    
    // Get today's date and time
    const now = new Date();
    const runDate = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    // Format time
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeString = `${hours}_${minutes}_${seconds}_${ampm}`;
    
    console.log('Run Date:', runDate);
    
    // Load template
    const templateUrl = `${import.meta.env.BASE_URL}2026_TOA_Slides_BR_VScode_3.12.26.pptx`;
    const response = await fetch(templateUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    
    console.log('Template loaded successfully');
    
    // Process ALL XML files
    const files = Object.keys(zip.files);
    const xmlFiles = files.filter(f => f.endsWith('.xml'));
    console.log(`Processing ${xmlFiles.length} XML files...`);
    
    let replacementsMade = 0;
    let filesModified = 0;
    
    xmlFiles.forEach((filename) => {
      let content = zip.files[filename].asText();
      const originalLength = content.length;
      
      // Try both case variations
      let modified = false;
      
      // Replace [Client]
      const afterClient = replaceFragmentedText(content, '[Client]', data.client);
      if (afterClient !== content) {
        console.log(`✓ Replaced [Client] in ${filename}`);
        content = afterClient;
        modified = true;
        replacementsMade++;
      }
      
      // Replace [Run Date]
      const afterRunDate = replaceFragmentedText(content, '[Run Date]', runDate);
      if (afterRunDate !== content) {
        console.log(`✓ Replaced [Run Date] in ${filename}`);
        content = afterRunDate;
        modified = true;
        replacementsMade++;
      }
      
      if (modified) {
        zip.file(filename, content);
        filesModified++;
        console.log(`  File size: ${originalLength} -> ${content.length} bytes`);
      }
    });
    
    console.log(`\n=== Summary ===`);
    console.log(`Files modified: ${filesModified}`);
    console.log(`Total replacements: ${replacementsMade}`);
    
    if (replacementsMade === 0) {
      console.error('⚠️ WARNING: NO REPLACEMENTS MADE!');
      console.error('This means the placeholders were not found in any file.');
      console.error('Check console above for details.');
    }
    
    // Generate modified PPTX
    const output = zip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    
    // Download with timestamp
    const link = document.createElement('a');
    link.href = URL.createObjectURL(output);
    link.download = `TOA_Request_${data.client.replace(/[^a-zA-Z0-9]/g, '_')}_${now.toISOString().split('T')[0]}_${timeString}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    console.log('✓ PowerPoint downloaded successfully');
  } catch (error) {
    console.error('❌ Error generating PowerPoint:', error);
    throw new Error(`Failed to generate PowerPoint: ${error instanceof Error ? error.message : String(error)}`);
  }
}