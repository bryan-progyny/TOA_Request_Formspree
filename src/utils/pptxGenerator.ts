/**
 * PowerPoint template generator
 * Loads template from public folder and replaces placeholders with form data
 */

import PizZip from 'pizzip';

export interface PPTXData {
  client: string;
  eligibleEmployees?: string;
  eligibleMembers?: string;
  pepm?: string;
  caseRate?: string;
  adoptionLimit?: string;
  surrogacyLimit?: string;
  feeType?: string;
  smartCyclesOption1?: string;
  smartCyclesOption2?: string;
}

/**
 * Simple replacement - just replaces text without touching XML structure
 */
function simpleReplace(xml: string, placeholder: string, value: string): string {
  // Use global replace for all occurrences
  return xml.split(placeholder).join(value);
}

/**
 * Replace fragmented [|eli.mem|] placeholder that may be split across XML tags
 * Allows any XML between each character: [, |, e, l, i, ., m, e, m, |, ]
 */
function replaceFragmentedEliMem(xml: string, value: string): { content: string; replaced: boolean } {
  // Pattern: [\s*<[^>]*>\s*]*|\s*<[^>]*>\s*]*e\s*<[^>]*>\s*]*l\s*<[^>]*>\s*]*i...
  const pattern = '\\[(?:\\s*<[^>]*>\\s*)*\\|(?:\\s*<[^>]*>\\s*)*e(?:\\s*<[^>]*>\\s*)*l(?:\\s*<[^>]*>\\s*)*i(?:\\s*<[^>]*>\\s*)*\\.(?:\\s*<[^>]*>\\s*)*m(?:\\s*<[^>]*>\\s*)*e(?:\\s*<[^>]*>\\s*)*m(?:\\s*<[^>]*>\\s*)*\\|(?:\\s*<[^>]*>\\s*)*\\]';
  const regex = new RegExp(pattern, 'gi');
  
  const matches: Array<{ match: string; index: number }> = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push({ match: match[0], index: match.index });
    console.log(`Found fragmented [|eli.mem|] at position ${match.index}`);
  }
  
  if (matches.length === 0) {
    return { content: xml, replaced: false };
  }
  
  // Replace in reverse order to preserve indices
  let result = xml;
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const before = result.substring(0, m.index);
    const after = result.substring(m.index + m.match.length);
    // Just insert the value - keep it simple
    result = before + value + after;
  }
  
  return { content: result, replaced: true };
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
    console.log('Eligible Employees:', data.eligibleEmployees || 'NOT PROVIDED');
    console.log('Eligible Members:', data.eligibleMembers || 'NOT PROVIDED');
    
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
    
    // DIAGNOSTIC: Find ALL placeholders in all slide files
    console.log('\n🔍 Searching for ALL bracketed placeholders in slide files...');
    xmlFiles.filter(f => f.includes('slide') && !f.includes('slideLayout') && !f.includes('slideMaster')).forEach((filename) => {
      const content = zip.files[filename].asText();
      const textRuns = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
      const bracketed = textRuns.filter(run => {
        const text = run.replace(/<[^>]*>/g, '');
        return text.includes('[') || text.includes(']');
      });
      if (bracketed.length > 0) {
        console.log(`\n📄 ${filename}:`);
        bracketed.forEach(run => {
          const text = run.replace(/<[^>]*>/g, '');
          console.log(`  "${text}"`);
        });
      }
    });
    console.log('\n---\n');
    
    xmlFiles.forEach((filename) => {
      let content = zip.files[filename].asText();
      const originalLength = content.length;
      
      // Search for placeholders - check for partial matches and fragments
      if (content.includes('[Fert') || content.includes('Fert.') || content.includes('.H1]') || content.includes('.h1]')) {
        console.log(`📍 Found partial/full [Fert.H1] in ${filename}`);
        // Show the actual text runs in this file
        const textRuns = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        const fertRuns = textRuns.filter(run => {
          const text = run.replace(/<[^>]*>/g, '');
          return text.includes('Fert') || text.includes('[') && text.toLowerCase().includes('h1');
        });
        if (fertRuns.length > 0) {
          console.log('  Fert-related text runs:', fertRuns.map(r => r.replace(/<[^>]*>/g, '')));
        }
      }
      if (content.includes('eli.mem')) {
        console.log(`📍 Found eli.mem in ${filename}`);
      }
      
      // DEBUG: Dump slide 1 XML to console for inspection
      if (filename === 'ppt/slides/slide1.xml') {
        console.log('\n=== DIAGNOSTIC: SLIDE 1 XML ANALYSIS ===');
        
        // Extract all text runs
        const textRuns = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
        console.log(`Found ${textRuns.length} text runs in slide 1:\n`);
        
        textRuns.forEach((run, i) => {
          const text = run.replace(/<[^>]*>/g, '');
          if (text.trim()) {
            // Highlight any text containing brackets or our keywords
            if (text.includes('[') || text.includes(']') || 
                text.toLowerCase().includes('client') || 
                text.toLowerCase().includes('run') || 
                text.toLowerCase().includes('date')) {
              console.log(`  Run ${i}: "${text}" ⭐ POTENTIAL PLACEHOLDER`);
            } else {
              console.log(`  Run ${i}: "${text}"`);
            }
          }
        });
        
        // Show XML snippet around brackets
        const bracketIndex = content.indexOf('[');
        if (bracketIndex !== -1) {
          console.log('\n📍 XML snippet around first "[" character:');
          const start = Math.max(0, bracketIndex - 150);
          const end = Math.min(content.length, bracketIndex + 300);
          const snippet = content.substring(start, end);
          console.log(snippet);
          console.log('');
        } else {
          console.log('\n⚠️ No "[" character found in slide 1 XML!');
        }
      }
      
      // Try both case variations
      let modified = false;
      
      // Replace [Client] (with trailing space)
      const afterClient = simpleReplace(content, '[Client] ', data.client + ' ');
      if (afterClient !== content) {
        console.log(`✓ Replaced [Client]  (with space) in ${filename}`);
        content = afterClient;
        modified = true;
        replacementsMade++;
      } else {
        // Try without space
        const afterClient2 = simpleReplace(content, '[Client]', data.client);
        if (afterClient2 !== content) {
          console.log(`✓ Replaced [Client] (no space) in ${filename}`);
          content = afterClient2;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [Run Date]
      const afterRunDate = simpleReplace(content, '[Run Date]', runDate);
      if (afterRunDate !== content) {
        console.log(`✓ Replaced [Run Date] in ${filename}`);
        content = afterRunDate;
        modified = true;
        replacementsMade++;
      }
      
      // Replace [Fert.H1] with eligible employees (capital H)
      if (data.eligibleEmployees) {
        const afterFerth1 = simpleReplace(content, '[Fert.H1]', data.eligibleEmployees);
        if (afterFerth1 !== content) {
          console.log(`✓ Replaced [Fert.H1] in ${filename}`);
          content = afterFerth1;
          modified = true;
          replacementsMade++;
        } else {
          // Try lowercase h as fallback
          const afterFerth1Lower = simpleReplace(content, '[Fert.h1]', data.eligibleEmployees);
          if (afterFerth1Lower !== content) {
            console.log(`✓ Replaced [Fert.h1] (lowercase) in ${filename}`);
            content = afterFerth1Lower;
            modified = true;
            replacementsMade++;
          }
        }
      }
      
      // Replace [eli.mem] with eligible members - remove brackets too!
      // Pattern: <a:t>[</a:t> ... <a:t>eli.mem</a:t> ... <a:t>]</a:t>
      // Replace entire thing with: <a:t>125</a:t>
      if (data.eligibleMembers) {
        // Match the bracket-eli.mem-bracket pattern across text runs
        const pattern = /<a:t>\[<\/a:t>(?:(?!<a:t>).)*<a:t>eli\.mem<\/a:t>(?:(?!<a:t>).)*<a:t>\]<\/a:t>/g;
        const afterElimem = content.replace(pattern, `<a:t>${data.eligibleMembers}</a:t>`);
        if (afterElimem !== content) {
          console.log(`✓ Replaced [eli.mem] with ${data.eligibleMembers} (removed brackets) in ${filename}`);
          content = afterElimem;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [PEPM] with fertility PEPM value
      if (data.pepm) {
        const afterPepm = simpleReplace(content, '[PEPM]', data.pepm);
        if (afterPepm !== content) {
          console.log(`✓ Replaced [PEPM] with ${data.pepm} in ${filename}`);
          content = afterPepm;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [coach.case.fee] with fertility case rate
      if (data.caseRate) {
        const afterCaseRate = simpleReplace(content, '[coach.case.fee]', data.caseRate);
        if (afterCaseRate !== content) {
          console.log(`✓ Replaced [coach.case.fee] with ${data.caseRate} in ${filename}`);
          content = afterCaseRate;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [AL] with adoption limit
      if (data.adoptionLimit) {
        const afterAL = simpleReplace(content, '[AL]', data.adoptionLimit);
        if (afterAL !== content) {
          console.log(`✓ Replaced [AL] with ${data.adoptionLimit} in ${filename}`);
          content = afterAL;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [SL] with surrogacy limit
      if (data.surrogacyLimit) {
        const afterSL = simpleReplace(content, '[SL]', data.surrogacyLimit);
        if (afterSL !== content) {
          console.log(`✓ Replaced [SL] with ${data.surrogacyLimit} in ${filename}`);
          content = afterSL;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [case.or.admin] with fee type
      if (data.feeType) {
        const afterFeeType = simpleReplace(content, '[case.or.admin]', data.feeType);
        if (afterFeeType !== content) {
          console.log(`✓ Replaced [case.or.admin] with ${data.feeType} in ${filename}`);
          content = afterFeeType;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [SCA] with smart cycles option 1 (formatted)
      if (data.smartCyclesOption1) {
        const formattedSCA = data.smartCyclesOption1 === '1' 
          ? '1 Smart Cycle' 
          : `${data.smartCyclesOption1} Smart Cycles`;
        const afterSCA = simpleReplace(content, '[SCA]', formattedSCA);
        if (afterSCA !== content) {
          console.log(`✓ Replaced [SCA] with ${formattedSCA} in ${filename}`);
          content = afterSCA;
          modified = true;
          replacementsMade++;
        }
      }
      
      // Replace [SCA2] with smart cycles option 2 (formatted)
      if (data.smartCyclesOption2) {
        const formattedSCA2 = data.smartCyclesOption2 === '1' 
          ? '1 Smart Cycle' 
          : `${data.smartCyclesOption2} Smart Cycles`;
        const afterSCA2 = simpleReplace(content, '[SCA2]', formattedSCA2);
        if (afterSCA2 !== content) {
          console.log(`✓ Replaced [SCA2] with ${formattedSCA2} in ${filename}`);
          content = afterSCA2;
          modified = true;
          replacementsMade++;
        }
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