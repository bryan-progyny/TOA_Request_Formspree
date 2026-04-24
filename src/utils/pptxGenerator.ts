/**
 * PowerPoint template generator
 * Loads template from public folder and replaces placeholders with form data
 */

import PizZip from 'pizzip';

export interface PPTXData {
  client: string;
}

/**
 * Aggressive text replacement that handles PowerPoint's XML fragmentation
 * Tries multiple strategies to catch text regardless of how it's split
 */
function replaceInPowerPointXml(xml: string, placeholder: string, value: string): string {
  let result = xml;
  
  // Strategy 1: Direct replacement (works if text is not fragmented)
  const directPattern = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  result = result.replace(directPattern, value);
  
  // Strategy 2: Replace with XML tags between each character
  // Handles: <a:t>[</a:t><a:t>C</a:t><a:t>lient</a:t><a:t>]</a:t>
  const chars = placeholder.split('');
  const fragmentPattern = chars.map(char => 
    char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:</a:t>\\s*<a:t[^>]*>)?'
  ).join('');
  const fragRegex = new RegExp(fragmentPattern, 'gi');
  
  // Find matches and replace them
  let match;
  const matches: Array<{ start: number; end: number; text: string }> = [];
  
  // Reset regex
  fragRegex.lastIndex = 0;
  while ((match = fragRegex.exec(result)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0]
    });
  }
  
  // Replace matches in reverse order to preserve indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const before = result.substring(0, m.start);
    const after = result.substring(m.end);
    result = before + value + after;
  }
  
  return result;
}

export async function generatePPTX(data: PPTXData): Promise<void> {
  try {
    console.log('Starting PowerPoint generation...');
    console.log('Data:', data);
    
    // Get today's date and time
    const now = new Date();
    const runDate = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    // Format time as HH:MM:SS AM/PM
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeString = `${hours}_${minutes}_${seconds}_${ampm}`;
    
    console.log('Run Date:', runDate);
    console.log('Time:', timeString);
    
    // Load template from public folder
    const templateUrl = `${import.meta.env.BASE_URL}2026_TOA_Slides_BR_VScode_3.12.26.pptx`;
    console.log('Template URL:', templateUrl);
    
    const response = await fetch(templateUrl);
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to load PowerPoint template: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength);
    
    const zip = new PizZip(arrayBuffer);
    
    // Find and replace text in ALL XML files (not just slides)
    const files = Object.keys(zip.files);
    console.log('Total files in PPTX:', files.length);
    
    let replacementCount = 0;
    let filesChecked = 0;
    
    files.forEach((filename) => {
      // Process ALL XML files in the presentation
      if (filename.endsWith('.xml')) {
        filesChecked++;
        
        let content = zip.files[filename].asText();
        
        // Log if we find the placeholder in raw XML
        if (content.includes('[Client]') || content.includes('[Run Date]') || 
            content.includes('[') || content.toLowerCase().includes('client') || 
            content.toLowerCase().includes('run date')) {
          console.log(`File ${filename} contains potential placeholder text`);
        }
        
        const originalContent = content;
        
        // Try replacing with both strategies
        content = replaceInPowerPointXml(content, '[Client]', data.client);
        content = replaceInPowerPointXml(content, '[Run Date]', runDate);
        
        if (content !== originalContent) {
          console.log(`✓ Successfully replaced text in ${filename}`);
          zip.file(filename, content);
          replacementCount++;
        }
      }
    });
    
    console.log(`Files checked: ${filesChecked}, Files modified: ${replacementCount}`);
    
    if (replacementCount === 0) {
      console.warn('WARNING: No replacements were made. Placeholders might not exist or are formatted differently.');
    }
    
    // Generate the modified PowerPoint
    const output = zip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    
    console.log('Generated blob size:', output.size);
    
    // Download file with timestamp
    const link = document.createElement('a');
    link.href = URL.createObjectURL(output);
    link.download = `TOA_Request_${data.client.replace(/[^a-zA-Z0-9]/g, '_')}_${now.toISOString().split('T')[0]}_${timeString}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    console.log('PowerPoint generated and download triggered successfully');
  } catch (error) {
    console.error('Error generating PowerPoint:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to generate PowerPoint: ${error instanceof Error ? error.message : String(error)}`);
  }
}