// =============================================================================
// app/page.tsx
// =============================================================================
// PURPOSE: Main UI - URL input, scan button, results display with copy buttons
// =============================================================================

// -----------------------------------------------------------------------------
// COMPONENT TYPE
// -----------------------------------------------------------------------------
// 'use client' - This is a client component (needs useState, event handlers)

// -----------------------------------------------------------------------------
// IMPORTS NEEDED
// -----------------------------------------------------------------------------
// import { useState } from 'react';

// -----------------------------------------------------------------------------
// TYPES TO DEFINE
// -----------------------------------------------------------------------------
// interface ScanResponse {
//   url: string;
//   scannedAt: string;
//   summary: { totalIssues: number; imagesMissingAlt: number };
//   issues: Issue[];
//   images: ImageWithFix[];
// }
//
// interface Issue {
//   id: string;
//   impact: string;
//   description: string;
//   html: string;
// }
//
// interface ImageWithFix {
//   src: string;
//   suggestedAlt: string;
//   fix: { before: string; after: string };
// }

// -----------------------------------------------------------------------------
// STATE TO MANAGE
// -----------------------------------------------------------------------------
// const [url, setUrl] = useState('');           // Input field value
// const [loading, setLoading] = useState(false); // Loading spinner
// const [results, setResults] = useState<ScanResponse | null>(null);
// const [error, setError] = useState('');        // Error message

// -----------------------------------------------------------------------------
// MAIN FUNCTION: handleScan
// -----------------------------------------------------------------------------
// Called when user clicks "Scan" button
//
// STEPS:
// 1. Set loading = true, clear previous results/errors
// 2. fetch('/api/scan', { method: 'POST', body: JSON.stringify({ url }) })
// 3. Parse response JSON
// 4. Set results or error based on response
// 5. Set loading = false

// -----------------------------------------------------------------------------
// HELPER FUNCTION: copyToClipboard
// -----------------------------------------------------------------------------
// const copyToClipboard = (text: string) => {
//   navigator.clipboard.writeText(text);
//   // Optional: show "Copied!" toast
// }

// -----------------------------------------------------------------------------
// UI STRUCTURE
// -----------------------------------------------------------------------------
// <main>
//
//   <!-- HEADER -->
//   <h1>Brenda</h1>
//   <p>AI-powered accessibility scanner</p>
//
//   <!-- URL INPUT SECTION -->
//   <div>
//     <input
//       type="url"
//       placeholder="https://example.com"
//       value={url}
//       onChange={(e) => setUrl(e.target.value)}
//     />
//     <button onClick={handleScan} disabled={loading || !url}>
//       {loading ? 'Scanning...' : 'Scan'}
//     </button>
//   </div>
//
//   <!-- ERROR MESSAGE -->
//   {error && <p className="error">{error}</p>}
//
//   <!-- RESULTS SECTION (only show if results exist) -->
//   {results && (
//     <div>
//
//       <!-- SUMMARY CARDS -->
//       <div className="grid">
//         <div>Total Issues: {results.summary.totalIssues}</div>
//         <div>Images Missing Alt: {results.summary.imagesMissingAlt}</div>
//       </div>
//
//       <!-- AI-GENERATED ALT TEXT SECTION -->
//       <h3>AI-Generated Alt Text</h3>
//       {results.images.map((img, i) => (
//         <div key={i}>
//           <img src={img.src} />           <!-- Preview -->
//           <p>Suggested: {img.suggestedAlt}</p>
//           <code>{img.fix.after}</code>    <!-- The fix -->
//           <button onClick={() => copyToClipboard(img.fix.after)}>
//             Copy fix
//           </button>
//         </div>
//       ))}
//
//       <!-- OTHER ISSUES SECTION -->
//       <h3>Other Issues</h3>
//       {results.issues.map((issue, i) => (
//         <div key={i}>
//           <span className={issue.impact}>{issue.impact}</span>
//           <p>{issue.description}</p>
//           <code>{issue.html}</code>
//         </div>
//       ))}
//
//     </div>
//   )}
//
// </main>

// -----------------------------------------------------------------------------
// STYLING NOTES (Tailwind classes to use)
// -----------------------------------------------------------------------------
// - Container: max-w-4xl mx-auto p-8
// - Input: flex-1 p-3 border rounded-lg
// - Button: px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50
// - Cards: p-4 bg-gray-100 rounded-lg
// - Code blocks: bg-gray-900 text-green-400 p-3 rounded font-mono
// - Impact badges:
//   - critical: bg-red-100 text-red-800
//   - serious: bg-orange-100 text-orange-800
//   - moderate/minor: bg-yellow-100 text-yellow-800

// -----------------------------------------------------------------------------
// ACCESSIBILITY (IRONIC BUT IMPORTANT)
// -----------------------------------------------------------------------------
// - Use semantic HTML (main, h1, h2, button)
// - Add aria-live for loading states
// - Ensure color contrast on our own UI
// - Keyboard navigation should work
// - Don't forget alt text on the preview images!
