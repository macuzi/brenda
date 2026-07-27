import * as Sentry from '@sentry/bun';

let initialized = false;

/**
 * Initialize Sentry once per process. Safe to call from multiple entry points.
 *
 * The DSN is read strictly from the environment (SENTRY_DSN) — there is no
 * hardcoded fallback. This repo is open source, so a committed DSN would let
 * anyone spam events into the project and burn its event quota. When SENTRY_DSN
 * is unset, this no-ops and the app runs normally with monitoring disabled.
 */
export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // no DSN configured -> monitoring off, app runs normally

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? 'development',
    // Send structured logs to Sentry
    enableLogs: true,
    // Tracing
    tracesSampleRate: 1.0, // Capture 100% of the transactions
  });
}

// Initialize on import so instrumentation and global error handlers are in
// place before any other module runs. Import this file first in every entry
// point (ES module imports are hoisted, so import order is what matters).
initSentry();
