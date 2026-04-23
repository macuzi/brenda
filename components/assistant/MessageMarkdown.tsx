'use client';

import * as React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Styled component map. We deliberately do NOT enable rehype-raw — Claude is
// often talking *about* HTML, and we don't want raw HTML in its replies to
// execute in our UI.
const components: Components = {
  p: ({ className, ...props }) => (
    <p className={cn('leading-relaxed', className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn('font-semibold text-foreground', className)} {...props} />
  ),
  em: ({ className, ...props }) => <em className={cn('italic', className)} {...props} />,
  a: ({ className, href, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary',
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn('flex list-disc flex-col gap-1 pl-5', className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn('flex list-decimal flex-col gap-1 pl-5', className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn('leading-relaxed [&>p]:m-0', className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn('border-l-2 border-border pl-3 text-muted-foreground', className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn('my-1 border-border', className)} {...props} />
  ),
  h1: ({ className, ...props }) => (
    <h1
      className={cn('mt-1 text-base font-semibold text-foreground', className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn('mt-1 text-base font-semibold text-foreground', className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn('mt-1 text-sm font-semibold text-foreground', className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn('mt-1 text-sm font-semibold text-foreground', className)}
      {...props}
    />
  ),
  code: ({ className, children, ...props }) => {
    // react-markdown 10 no longer passes `inline`; detect block vs. inline by
    // whether the parent renderer wrapped us in <pre>. We render the same
    // <code> here either way and let the `pre` renderer style the block.
    const isBlock =
      typeof className === 'string' && /\blanguage-/.test(className);
    if (isBlock) {
      return (
        <code className={cn('font-mono text-xs leading-relaxed', className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn(
          'rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, children, ...props }) => (
    <pre
      className={cn(
        'overflow-x-auto rounded-md border bg-muted p-3 font-mono text-xs leading-relaxed',
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ className, ...props }) => (
    <div className="overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-sm', className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead className={cn('border-b border-border', className)} {...props} />
  ),
  tbody: ({ className, ...props }) => (
    <tbody className={cn('[&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0', className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        'px-2 py-1.5 text-left text-xs font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td className={cn('px-2 py-1.5 align-top', className)} {...props} />
  ),
};

export function MessageMarkdown({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3 break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
