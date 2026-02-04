import { NextRequest, NextResponse } from 'next/server';
import { scanPage } from '@/lib/scanner';
import { generateAltText } from '@/lib/ai';

export async function POST (request: NextRequest) {
  const { url } = await request.json()
  const scanResult = await scanPage(url)
  
  console.log(`url: ${url}`, `scanResult: ${scanResult}`)

  const imageFixes = await Promise.all(                                                                                                                                                                            
    scanResult.images.map(async (image) => {                                                                                                                                                                       
      try {                                                                                                                                                                                                        
        const suggestedAlt = await generateAltText(image.src)                                                                                                                                                      
        return {                                                                                                                                                                                                   
          ...image,                                                                                                                                                                                                
          suggestedAlt,                                                                                                                                                                                            
          fix: {                                                                                                                                                                                                   
            before: `<img src="${image.src}">`,                                                                                                                                                                    
            after: `<img src="${image.src}" alt="${suggestedAlt}">`                                                                                                                                                
          }                                                                                                                                                                                                        
        }                                                                                                                                                                                                          
      } catch (error) {                                                                                                                                                                                            
        return {                                                                                                                                                                                                   
          ...image,                                                                                                                                                                                                
          suggestedAlt: 'Unable to generate alt text',                                                                                                                                                             
          fix: {                                                                                                                                                                                                   
            before: `<img src="${image.src}">`,                                                                                                                                                                    
            after: `<img src="${image.src}" alt="">`                                                                                                                                                               
          }                                                                                                                                                                                                        
        }                                                                                                                                                                                                          
      }                                                                                                                                                                                                            
    })                                                                                                                                                                                                             
  )    

  return NextResponse.json({
    url, 
    scannedAt: new Date().toISOString(),
    summary: {
      totalIssues: scanResult.issues.length,
      imagesMissingAlt: scanResult.images.length
    },
    issues: scanResult.issues,
    images: imageFixes
  })
}


// 5. ERROR HANDLING
//    - try/catch the whole thing
//    - Return 400 for missing URL
//    - Return 500 for scan/AI failures
//    - Include error details for debugging


// -----------------------------------------------------------------------------
// PERFORMANCE CONSIDERATIONS
// -----------------------------------------------------------------------------
// - Scanning can take 10-30 seconds
// - AI calls add ~1-2 seconds per image
// - For many images, this could timeout on serverless
// - Consider: limiting images processed, streaming response, background jobs

// -----------------------------------------------------------------------------
// SECURITY CONSIDERATIONS
// -----------------------------------------------------------------------------
// - Validate URL to prevent SSRF attacks
// - Don't scan localhost or internal IPs
// - Rate limit to prevent abuse
// - Consider: URL allowlist, request throttling
