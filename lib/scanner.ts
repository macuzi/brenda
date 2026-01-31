import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { ScanResult, ImageMissingAlt, Issue } from './types';


export async function scanPage(url: string): Promise<ScanResult> {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 30000
  })

  const axeResults = await new AxeBuilder({ page }).analyze() 

  const images = await page.evaluate(() => {
    return Array.from(document.images)
      .filter(img => !img.alt)
      .map((img) => ({
        src: img.src,
        alt: img.alt || null,
        selector: img.id ? `#${img.id}` : `img[src="${img.src}"]`    
      }))
  })

  const issues: Issue[] = axeResults.violations.map(v => ({                                                                                                                                                        
    id: v.id,                                                                                                                                                                                                      
    impact: v.impact as 'critical' | 'serious' | 'moderate' | 'minor',                                                                                                                                             
    description: v.description,                                                                                                                                                                                    
    html: v.nodes[0]?.html || '',                                                                                                                                                                                  
    selector: v.nodes[0]?.target[0] as string || ''                                                                                                                                                                
  }));                                                                                                                                                                                                             
       

  await context.close()
  await browser.close()

  return { url, issues, images }
}

// -----------------------------------------------------------------------------
// ERROR HANDLING TO CONSIDER
// -----------------------------------------------------------------------------
// - URL is invalid or unreachable
// - Page takes too long to load (timeout)
// - Page has JavaScript errors that prevent rendering
// - Browser fails to launch (missing dependencies)
//
// Wrap in try/catch and return meaningful errors
