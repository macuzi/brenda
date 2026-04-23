import { NextRequest, NextResponse } from 'next/server';
import { generateFixSuggestion } from '@/lib/ai/fix';
import type { Issue } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Generates a concrete code fix for one axe violation on demand. Called
// from the ticket actions when the user clicks Copy or Open-in-Linear, so
// we only pay for issues the user actually acts on (vs. generating fixes
// for every violation at scan time).
export async function POST(request: NextRequest) {
  let issue: Issue;
  let scanUrl: string;
  try {
    const body = await request.json();
    if (
      !body?.issue ||
      typeof body.issue.id !== 'string' ||
      typeof body.scanUrl !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    issue = body.issue;
    scanUrl = body.scanUrl;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const suggestion = await generateFixSuggestion(issue, scanUrl);
    return NextResponse.json(suggestion);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to generate fix',
        details: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500 },
    );
  }
}
