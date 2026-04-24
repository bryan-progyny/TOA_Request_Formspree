/**
 * PowerPoint template generator
 * Loads template from public folder and replaces placeholders with form data
 */

import PizZip from 'pizzip';

export interface PPTXData {
  client: string;
}

export async function generatePPTX(data: PPTXData): Promise<void> {
  try {
    console.log('Starting PowerPoint generation...');
    console.log('Data:', data);
    
    // Get today's date in MM/DD/YYYY format
    const today = new Date();
    const runDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;
    console.log('Run Date:', runDate);
    
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
    
    files.forEach((filename) => {
      // Process slides, slide masters, and slide layouts
      if ((filename.startsWith('ppt/slides/slide') || 
           filename.startsWith('ppt/slideMasters/') || 
           filename.startsWith('ppt/slideLayouts/')) && 
          filename.endsWith('.xml')) {
        console.log('Processing:', filename);
        let content = zip.files[filename].asText();
        
        // Check if content contains our placeholders
        const hasClient = /\[Client\]/gi.test(content);
        const hasRunDate = /\[Run Date\]/gi.test(content);
        
        if (hasClient || hasRunDate) {
          console.log(`Found placeholders in ${filename}:`, { hasClient, hasRunDate });
        }
        
        // Replace placeholders (case-insensitive)
        const originalContent = content;
        content = content.replace(/\[Client\]/gi, data.client);
        content = content.replace(/\[Run Date\]/gi, runDate);
        
        if (content !== originalContent) {
          console.log(`Replaced placeholders in ${filename}`);
          zip.file(filename, content);
        }
      }
    });
    
    // Generate the modified PowerPoint
    const output = zip.generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    
    console.log('Generated blob size:', output.size);
    
    // Download file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(output);
    link.download = `TOA_Request_${data.client.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`;
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