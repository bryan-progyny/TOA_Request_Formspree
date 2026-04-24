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
    
    // Find and replace text in all slides
    const files = Object.keys(zip.files);
    console.log('Files in PPTX:', files.filter(f => f.includes('slide')));
    
    files.forEach((filename) => {
      if (filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')) {
        console.log('Processing:', filename);
        let content = zip.files[filename].asText();
        
        // Replace [client] placeholder with actual value
        const originalContent = content;
        content = content.replace(/\[client\]/g, data.client);
        
        if (content !== originalContent) {
          console.log(`Replaced [client] with "${data.client}" in ${filename}`);
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
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Replace [client] with actual value
    doc.render(data);
    
    // Generate modified PowerPoint
    const output = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    
    // Download file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(output);
    link.download = `TOA_Request_${data.client.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    console.log('PowerPoint generated successfully');
  } catch (error) {
    console.error('Error generating PowerPoint:', error);
    throw new Error('Failed to generate PowerPoint. Please try again.');
  }
}
