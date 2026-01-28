// =============================================================================
// lib/ai.ts
// =============================================================================
// PURPOSE: Use Claude Vision API to generate alt text for images
// =============================================================================

// -----------------------------------------------------------------------------
// IMPORTS NEEDED
// -----------------------------------------------------------------------------
// import Anthropic from '@anthropic-ai/sdk';

// -----------------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------------------
// const client = new Anthropic();
//
// Note: Anthropic SDK automatically reads ANTHROPIC_API_KEY from environment
// No need to pass it explicitly

// -----------------------------------------------------------------------------
// MAIN FUNCTION: generateAltText
// -----------------------------------------------------------------------------
// export async function generateAltText(imageUrl: string): Promise<string>
//
// STEPS:
//
// 1. CALL CLAUDE VISION API
//    - Use client.messages.create()
//    - Model: 'claude-sonnet-4-20250514' (has vision capabilities)
//    - max_tokens: 150 (alt text should be concise)
//
// 2. STRUCTURE THE MESSAGE
//    - Content array with two parts:
//      a) Image: { type: 'image', source: { type: 'url', url: imageUrl } }
//      b) Text prompt with instructions
//
// 3. PROMPT ENGINEERING
//    - Be specific about what makes good alt text:
//      * Be descriptive but concise
//      * Don't start with "Image of" or "Picture of"
//      * Keep under 125 characters
//      * If purely decorative, return "decorative"
//      * Describe what's meaningful for context
//
// 4. PARSE RESPONSE
//    - Check response.content[0].type === 'text'
//    - Return response.content[0].text
//    - Handle edge cases (empty response, errors)

// -----------------------------------------------------------------------------
// EXAMPLE CLAUDE API CALL STRUCTURE
// -----------------------------------------------------------------------------
// const response = await client.messages.create({
//   model: 'claude-sonnet-4-20250514',
//   max_tokens: 150,
//   messages: [{
//     role: 'user',
//     content: [
//       {
//         type: 'image',
//         source: { type: 'url', url: imageUrl }
//       },
//       {
//         type: 'text',
//         text: `Generate concise alt text for this image.
//                Rules:
//                - Be specific and descriptive
//                - Don't start with "Image of" or "Picture of"
//                - Keep under 125 characters
//                - If purely decorative, return exactly: decorative`
//       }
//     ]
//   }]
// });

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
