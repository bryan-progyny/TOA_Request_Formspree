/**
 * PowerPoint template generator
 * Loads template from public folder and replaces placeholders with form data
 */

import PizZip from 'pizzip';

export interface PPTXData {
  client: string;
}

/**
 * Replace text in PowerPoint XML, handling cases where text is split across elements
 */
function replaceTextInXml(xml: string, searchText: string, replaceText: string): string {
  // Remove all XML tags to get plain text, do replacement, then put tags back
  // This handles cases where [Client] is split like: <a:t>[</a:t><a:t>Client</a:t><a:t>]</a:t>
  
  // Find all text runs (a:t elements)
  const textPattern = /<a:t[^>]*>([^<]*)<\/a:t>/g;
  let match;
  const textRuns: Array<{ fullMatch: string; text: string; start: number; end: number }> = [];
  
  while ((match = textPattern.exec(xml)) !== null) {
    textRuns.push({
      fullMatch: match[0],
      text: match[1],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Concatenate all text content
  const plainText = textRuns.map(run => run.text).join('');
  
  // Check if searchText exists in plain text
  if (!plainText.includes(searchText)) {
    return xml;
  }
  
  console.log(`Found "${searchText}" in concatenated text`);
  
  // Replace in plain text
  const replacedText = plainText.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replaceText);
  
  // Now we need to reconstruct the XML
  // Strategy: Replace all the text runs with the new text in a single run
  if (textRuns.length > 0) {
    const firstRun = textRuns[0];
    const lastRun = textRuns[textRuns.length - 1];
    
    // Replace everything from first run to last run with a single new run containing replaced text
    const before = xml.substring(0, firstRun.start);
    const after = xml.substring(lastRun.end);
    const newRun = `<a:t>${replacedText}</a:t>`;
    
    return before + newRun + after;
  }
  
  return xml;
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
    hours = hours % 12 || 12; // Convert to 12-hour format
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
    
    // Find and replace text in all slides and slide masters
    const files = Object.keys(zip.files);
    console.log('Files in PPTX:', files.filter(f => f.includes('slide')));
    
    let replacementCount = 0;
    
    files.forEach((filename) => {
      // Process slides, slide masters, and slide layouts
      if ((filename.startsWith('ppt/slides/slide') || 
           filename.startsWith('ppt/slideMasters/') || 
           filename.startsWith('ppt/slideLayouts/')) && 
          filename.endsWith('.xml')) {
        
        let content = zip.files[filename].asText();
        const originalContent = content;
        
        // Replace placeholders using robust method
        content = replaceTextInXml(content, '[Client]', data.client);
        content = replaceTextInXml(content, '[Run Date]', runDate);
        
        if (content !== originalContent) {
          console.log(`Replaced placeholders in ${filename}`);
          zip.file(filename, content);
          replacementCount++;
        }
      }
    });
    
    console.log(`Total files with replacements: ${replacementCount}`);
    
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