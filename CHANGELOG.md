# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **AI assistant side panel.** Mintlify-style slide-out chat (`components/assistant/*`)
  opened via a persistent ⌘K / sparkle trigger top-right. 480px right side on
  desktop, 85vh bottom drawer on mobile, optional 720px expanded mode. Closes
  on Esc with focus returning to the trigger.
- **Streaming chat endpoint.** `POST /api/chat` — server-sent events, manual
  tool-use loop (up to 4 iterations), Anthropic error classification mapped to
  typed `ChatErrorCode`s with retryable flag (`app/api/chat/route.ts`).
- **Scan-aware system prompt.** `lib/ai/system-prompt.ts` positions Claude as a
  senior a11y specialist and requires WCAG citations, semantic-HTML-first
  recommendations, and no sycophantic preambles.
- **Scan context injection.** `lib/ai/build-context.ts` renders the top 20
  issues (ranked by impact) with rule id, impact, WCAG tags, occurrence count,
  help, selector, and a 240-char HTML snippet — kept under ~8k tokens.
- **`get_issue_details` tool.** `lib/ai/tools.ts` exposes full per-issue
  payloads (all occurrences, WCAG tags, help URLs) so Claude can fetch detail
  on demand rather than reading everything up front.
- **Model configuration.** `lib/ai/client.ts` — cached Anthropic singleton;
  model resolved from `ANTHROPIC_MODEL` env var with `claude-sonnet-4-6` as
  the default.
- **Contextual suggestion chips** (`components/assistant/suggestions.ts`):
  three branches for no scan / clean scan / scan with issues (the top issue's
  rule id is threaded into the prompts).
- **Composer ergonomics** (`components/assistant/AssistantComposer.tsx`):
  auto-grow textarea (1–6 rows), ⌘↵ to send, ↵ newline, Esc close, ↑ edit
  last user message. Attach button is present-but-disabled as a visible
  placeholder.
- **Keyboard shortcut cheatsheet** (`?` button or Shift+?).
- **`useKeyboardShortcut` hook** — meta/ctrl-aware, respects typing in inputs.
- **React context + `useReducer` state** — `AssistantProvider` owns messages,
  open/expanded state, streaming flag, errors, abort controller, and scan
  snapshot. Per-session persistence via `sessionStorage`.
- **Enriched scanner** (`lib/scanner.ts`): captures every axe node (not only
  the first), extracts `help`, `helpUrl`, and human-readable WCAG refs from
  axe tags (`wcag143` → "WCAG 1.4.3"; `wcag21aa` → "WCAG 2.1 AA"). Browser
  teardown moved inside `try/finally`.
- **Summary `byImpact` counts** returned from `POST /api/scan`.
- **shadcn primitives** — Button, Sheet (Dialog-based), Input, Textarea,
  Badge (with `critical`/`serious`/`moderate`/`minor` variants),
  ScrollArea, Separator, Skeleton, Tooltip, Kbd.
- **Design system**: Tailwind tokens in `app/globals.css`, indigo-700 accent
  on light (~9:1 AAA) and indigo-300 on dark (~9.3:1 AAA), Inter +
  JetBrains Mono via `next/font`, `prefers-reduced-motion` override,
  `:focus-visible` with ring-2 ring-offset-2.
- **Playwright a11y test** (`__tests__/assistant.a11y.test.ts`): scans
  closed and open panel states against WCAG 2.1 AA with `@axe-core/playwright`,
  verifies ⌘K open / Esc close / focus-return-to-trigger, and asserts the
  composer receives focus on open. `npm test` runs the full suite.

### Changed

- **`Issue` type** gains `help`, `helpUrl`, `wcagTags`, and `nodes: IssueNode[]`
  (each with `html`, `selector`, `target[]`) to expose all occurrences.
- **`ScanResponse.summary`** gains `byImpact: Record<Impact, number>`.
- **Home page** redesigned around a minimal typographic layout with
  copy-to-clipboard fixes, impact badges, WCAG references next to each issue,
  and occurrence counts.
- **`generateAltText`** now uses the shared Anthropic client and the
  `DEFAULT_MODEL` constant.

### Security

- Anthropic API key stays server-side; no browser-exposed credentials. The
  chat route validates `messages` shape, caps 50 messages × 16k chars each,
  and caps tool-use iterations at 4.
