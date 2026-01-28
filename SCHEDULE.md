# Brenda MVP - 2 Week Build Schedule

**Start Date:** Monday, Feb 3, 2025
**Ship Date:** Friday, Feb 14, 2025
**Daily Hours:** 9am - 2pm (5 hours)

---

## Week 1: Core Functionality

### Day 1 - Monday, Feb 3
**Focus:** Project Setup

- [ ] Run `npm install` to install all dependencies
- [ ] Run `npx playwright install chromium` to download browser
- [ ] Create `.env.local` with your Anthropic API key
- [ ] Test Playwright works: write a simple script that loads a page
- [ ] Verify you can `console.log` the page title

**Files to work on:**
- `lib/scanner.ts` (just the browser launch part)

**Success:** You can run a script that opens a URL and prints the page title.

**Notes:**
```
- If Playwright install fails, check Node version (need 18+)
- Common issue: missing system dependencies on Linux
- On Mac, should "just work"
```

---

### Day 2 - Tuesday, Feb 4
**Focus:** Scanner - axe-core Integration

- [ ] Import and set up AxeBuilder
- [ ] Run `new AxeBuilder({ page }).analyze()` on a test page
- [ ] Understand the structure of axe results (violations array)
- [ ] Map violations to our simpler Issue type
- [ ] Test on a known bad page (find one with accessibility issues)

**Files to work on:**
- `lib/scanner.ts`

**Success:** Scanner returns a list of accessibility violations with id, impact, description.

**Notes:**
```
- axe-core docs: https://github.com/dequelabs/axe-core
- Test pages: try scanning any news site (usually have issues)
- violations vs incomplete vs passes - we only care about violations
```

---

### Day 3 - Wednesday, Feb 5
**Focus:** Scanner - Images + Error Handling

- [ ] Add `page.evaluate()` to extract all images from DOM
- [ ] Filter to images missing alt text (or empty alt)
- [ ] Generate CSS selectors for each image
- [ ] Add try/catch for timeouts, invalid URLs
- [ ] Add timeout parameter (30 second default)
- [ ] Test edge cases: slow sites, sites that block bots

**Files to work on:**
- `lib/scanner.ts`

**Success:** Scanner returns issues + images array, handles errors gracefully.

**Notes:**
```
- page.evaluate() runs JS in the browser context
- document.images gives all <img> elements
- Some sites block headless browsers - may need to set user agent
- Consider: what if page has 100 images? (limit for MVP)
```

---

### Day 4 - Thursday, Feb 6
**Focus:** AI Integration - Claude Vision

- [ ] Set up Anthropic client in `lib/ai.ts`
- [ ] Write `generateAltText(imageUrl)` function
- [ ] Test with a few real image URLs
- [ ] Tune the prompt for good alt text output
- [ ] Handle errors (image not accessible, API failures)
- [ ] Test with different image types (photos, icons, charts)

**Files to work on:**
- `lib/ai.ts`

**Success:** Given an image URL, Claude returns useful alt text.

**Notes:**
```
- API docs: https://docs.anthropic.com/claude/reference/messages
- Vision is in the messages API, not a separate endpoint
- Some images will fail (CORS, auth required) - return fallback
- Cost: ~$0.003 per image - track your usage
```

---

### Day 5 - Friday, Feb 7
**Focus:** API Route - Wire It Together

- [ ] Create POST handler in `app/api/scan/route.ts`
- [ ] Parse URL from request body
- [ ] Call `scanPage()` to get issues + images
- [ ] Loop through images, call `generateAltText()` for each
- [ ] Build response with issues + images + fixes
- [ ] Add basic error handling (400 for missing URL, 500 for failures)
- [ ] Test with curl or Postman

**Files to work on:**
- `app/api/scan/route.ts`

**Success:** POST to `/api/scan` with a URL returns full results JSON.

**Notes:**
```
- Use Promise.all() for parallel AI calls (faster)
- Consider: what if 20 images? Could timeout on Vercel
- For MVP: limit to first 5 images
- Test locally with: curl -X POST http://localhost:3000/api/scan -d '{"url":"..."}'
```

---

## Week 2: UI + Ship

### Day 6 - Monday, Feb 10
**Focus:** UI Basics

- [ ] Uncomment Tailwind directives in `globals.css`
- [ ] Uncomment layout.tsx setup
- [ ] Build the page structure in `page.tsx`
- [ ] Add URL input field and Scan button
- [ ] Add useState for url, loading, results, error
- [ ] Wire up button to call `/api/scan`
- [ ] Display raw JSON results (just to see it works)

**Files to work on:**
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`

**Success:** You can paste a URL, click Scan, and see raw results on page.

**Notes:**
```
- Start ugly, make it pretty later
- 'use client' at top of page.tsx (client component)
- fetch('/api/scan', { method: 'POST', body: JSON.stringify({ url }) })
```

---

### Day 7 - Tuesday, Feb 11
**Focus:** UI Results Display

- [ ] Create summary cards (total issues, images missing alt)
- [ ] Display images section with thumbnails
- [ ] Show AI-generated alt text for each image
- [ ] Show the "fix" code block (the img tag with alt)
- [ ] Display other issues with severity badges
- [ ] Color-code by impact (critical=red, serious=orange, etc.)

**Files to work on:**
- `app/page.tsx`

**Success:** Results are displayed in a readable, organized way.

**Notes:**
```
- Tailwind classes for cards: p-4 bg-gray-100 rounded-lg
- Severity badge colors in the page.tsx comments
- For code blocks: bg-gray-900 text-green-400 font-mono
```

---

### Day 8 - Wednesday, Feb 12
**Focus:** UI Polish

- [ ] Add loading spinner/state while scanning
- [ ] Add "Copy" button for each fix
- [ ] Show success toast/message when copied
- [ ] Add error message display (red text)
- [ ] Disable button while loading
- [ ] Add placeholder text / empty state
- [ ] Make it look decent (spacing, typography)

**Files to work on:**
- `app/page.tsx`

**Success:** UI feels polished - loading states, copy works, errors shown.

**Notes:**
```
- navigator.clipboard.writeText(text) for copy
- Consider: add a "Copied!" state that resets after 2 seconds
- Test the loading state - scanning takes 10-30 seconds
```

---

### Day 9 - Thursday, Feb 13
**Focus:** Testing + Edge Cases

- [ ] Test on 10+ real websites (mix of good/bad accessibility)
- [ ] Test error cases: invalid URL, unreachable site, timeout
- [ ] Test sites with many images (does it handle gracefully?)
- [ ] Test sites with no issues (show success message?)
- [ ] Fix any bugs found
- [ ] Check your own UI for accessibility (ironic if it's not accessible!)
- [ ] Test on mobile (responsive?)

**Files to work on:**
- Any files that need bug fixes

**Success:** App handles all common cases without crashing.

**Test these URLs:**
```
- https://example.com (simple, should work)
- https://www.nytimes.com (complex, many images)
- https://gov.uk (usually good accessibility)
- https://any-small-business.com (usually bad accessibility)
- Invalid URL: "not-a-url"
- Unreachable: "https://thissitedoesnotexist12345.com"
```

---

### Day 10 - Friday, Feb 14
**Focus:** Deploy + Ship

- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Add `ANTHROPIC_API_KEY` to Vercel environment variables
- [ ] Deploy and test live URL
- [ ] Fix any production-only issues
- [ ] Test the live site on a few URLs
- [ ] Share the link!

**Files to work on:**
- None (deployment day)

**Success:** Brenda is live and you can share the URL.

**Notes:**
```
- Vercel auto-deploys from main branch
- Check Vercel function logs if API fails
- Playwright on Vercel needs the memory/timeout config (already in vercel.json)
- May need to troubleshoot serverless issues
```

---

## Post-MVP (Future)

After shipping, consider:
- [ ] Full site crawling (multiple pages)
- [ ] User accounts + saved history
- [ ] More AI fix types (contrast, ARIA)
- [ ] GitHub PR integration
- [ ] Pricing / monetization

---

## Resources

- **Playwright docs:** https://playwright.dev/docs/intro
- **axe-core rules:** https://dequeuniversity.com/rules/axe/
- **Claude Vision docs:** https://docs.anthropic.com/claude/docs/vision
- **Next.js App Router:** https://nextjs.org/docs/app
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Daily Checklist Template

```
Date: ___________
Focus: ___________

Morning (9am-11am):
- [ ] Task 1
- [ ] Task 2

Midday (11am-1pm):
- [ ] Task 3
- [ ] Task 4

Afternoon (1pm-2pm):
- [ ] Wrap up
- [ ] Test what you built
- [ ] Commit code

Blockers:
-

Tomorrow:
-
```
