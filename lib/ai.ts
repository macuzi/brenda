import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config'   

import { ImageMissingAlt, ImageWithFix } from './types';


const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });



export async function generateAltText(imageUrl: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { 
            type: 'url', 
            url: imageUrl 
          }
        },
        {
          type: 'text',
          text: `Generate concise alt text for this image.
            Rules:
            - Be specific and descriptive
            - Don't start with "Image of" or "Picture of"
            - Keep under 125 characters
            - If purely decorative, return exactly: decorative`               
        }
      ]
    }]    
  })
  
  if (message.content[0].type === 'text') {
    return message.content[0].text
  }

  throw new Error('Response did not include text')
}




// -----------------------------------------------------------------------------
// ERROR HANDLING TO CONSIDER
// -----------------------------------------------------------------------------
// - Image URL is inaccessible (403, 404, CORS)
// - Image format not supported
// - API rate limits
// - API key invalid or missing
// - Network timeout
//
// Return a fallback message like "Unable to generate alt text" on failure
// Log errors for debugging but don't crash the scan

// -----------------------------------------------------------------------------
// OPTIONAL: BATCH PROCESSING
// -----------------------------------------------------------------------------
// For multiple images, consider:
// - Promise.all() for parallel requests (faster)
// - Promise.allSettled() to handle partial failures
// - Rate limiting to avoid API throttling
// - Caching repeated images (same src = same alt)
