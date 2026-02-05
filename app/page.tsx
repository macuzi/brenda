'use client'

import { useState } from 'react';
import { ScanResponse, Issue, ImageWithFix } from '@/lib/types'                                                                                                                                       

function Home() {
  const [url, setUrl] = useState('');           
  const [loading, setLoading] = useState(false); 
  const [results, setResults] = useState<ScanResponse | null>(null);
  const [error, setError] = useState('');        

  async function handleScan() {
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to fetch from /api/scan: ${res.status} ${errorText}`)
      }

      const data: ScanResponse = await res.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // build a show "Copied!" toast
  }

  return (
    <main>
      <h1>Brenda</h1>

      <div>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleScan} disabled={loading || !url}>
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>
  
      {error && <p className="error">{error}</p>}
  
      {results && (
        <div>
          <div className="grid">
            <div>Total Issues: {results.summary.totalIssues}</div>
            <div>Images Missing Alt: {results.summary.imagesMissingAlt}</div>
          </div>
  
  
          <h3>AI-Generated Alt Text</h3>
          {results.images.map((img, i) => (
            <div key={i}>
              <img src={img.src} />           
              <p>Suggested: {img.suggestedAlt}</p>
              <code>{img.fix.after}</code>    
              <button onClick={() => copyToClipboard(img.fix.after)}>
                Copy fix
              </button>
            </div>
          ))}
  
          <h3>Other Issues</h3>

          {results.issues.map((issue, i) => (
            <div key={i}>
              <span className={issue.impact}>{issue.impact}</span>
              <p>{issue.description}</p>
              <code>{issue.html}</code>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default Home

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
