import { NextRequest, NextResponse } from 'next/server';
import { scanPage } from '@/lib/scanner';
import { generateAltText } from '@/lib/ai';
import type { Impact, ImageWithFix, ScanResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

function emptyImpactCount(): Record<Impact, number> {
  return { critical: 0, serious: 0, moderate: 0, minor: 0 };
}

export async function POST(request: NextRequest) {
  let url: string;
  try {
    const body = await request.json();
    url = body?.url;
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const scanResult = await scanPage(url);

    const imageFixes: ImageWithFix[] = await Promise.all(
      scanResult.images.map(async (image) => {
        try {
          const suggestedAlt = await generateAltText(image.src);
          return {
            ...image,
            suggestedAlt,
            fix: {
              before: `<img src="${image.src}">`,
              after: `<img src="${image.src}" alt="${suggestedAlt}">`,
            },
          };
        } catch {
          return {
            ...image,
            suggestedAlt: 'Unable to generate alt text',
            fix: {
              before: `<img src="${image.src}">`,
              after: `<img src="${image.src}" alt="">`,
            },
          };
        }
      }),
    );

    const byImpact = emptyImpactCount();
    for (const issue of scanResult.issues) byImpact[issue.impact]++;

    const response: ScanResponse = {
      url,
      scannedAt: new Date().toISOString(),
      summary: {
        totalIssues: scanResult.issues.length,
        imagesMissingAlt: scanResult.images.length,
        byImpact,
      },
      issues: scanResult.issues,
      images: imageFixes,
      passes: scanResult.passes,
    };

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Scan failed',
        details: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500 },
    );
  }
}
