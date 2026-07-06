import { Glob } from 'bun';

const glob = new Glob('**/*.md');
const sourceRoot = 'data/sources';

type SourceMetadata = {
  source: string;
  topic: string;
  title: string;
  url: string;
  wcag_sc?: string;
};

function parseSourceFile(text: string): {
  metadata: SourceMetadata;
  body: string;
} {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error('Missing frontmatter');
  }

  const [, rawFrontmatter, body] = match;
  const metadata = Object.fromEntries(
    rawFrontmatter
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [key, ...valueParts] = line.split(':');
        return [key.trim(), valueParts.join(':').trim()];
      }),
  ) as SourceMetadata;

  return {
    metadata,
    body: body.trim(),
  };
}

for await (const relativePath of glob.scan(sourceRoot)) {
  const filePath = `${sourceRoot}/${relativePath}`;
  const text = await Bun.file(filePath).text();
  const { metadata, body } = parseSourceFile(text);

  console.log(filePath, metadata.title, body.length);
}