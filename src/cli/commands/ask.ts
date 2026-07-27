import * as Sentry from '@sentry/bun';
import { askQuestion } from '../../ask';

function formatSource(title: string, url: string, wcagSc?: string): string {
  const wcag = wcagSc ? ` (${wcagSc})` : '';
  return `- ${title}${wcag} — ${url}`;
}

export async function runAsk(question: string) {
  if (!question.trim()) {
    console.error(
      'Provide a question, e.g. brenda ask "Is placeholder text enough for a label?"',
    );
    process.exit(1);
  }

  try {
    const result = await askQuestion(question);

    console.log(`Answer: ${result.answer}`);
    console.log('');
    console.log(`Why: ${result.why}`);
    console.log('');
    console.log('Sources:');

    if (result.sources.length === 0) {
      console.log('- None');
    } else {
      for (const source of result.sources) {
        console.log(formatSource(source.title, source.url, source.wcag_sc));
      }
    }

    console.log('');
    console.log(`Practical fix: ${result.practicalFix}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    Sentry.captureException(error);
    // Flush before exiting — the CLI process exits too fast for the
    // background transport to send buffered events otherwise.
    await Sentry.flush(2000);
    process.exit(1);
  }
}
