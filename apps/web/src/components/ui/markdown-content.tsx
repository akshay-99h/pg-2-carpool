import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const unorderedListPattern = /^[-*+]\s+/;
const orderedListPattern = /^\d+\.\s+/;
const headingPattern = /^(#{1,6})\s+(.*)$/;
const fencePattern = /^```/;
const quotePattern = /^>\s?/;
const horizontalRulePattern = /^(\*{3,}|-{3,}|_{3,})$/;

function sanitizeHref(rawHref: string) {
  const href = rawHref.trim();
  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('/') ||
    href.startsWith('#')
  ) {
    return href;
  }
  return '#';
}

function parseInline(content: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\n]+\*|_[^_\n]+_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(content);
  while (match) {
    const token = match[0];
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(content.slice(lastIndex, start));
    }

    const tokenKey = `${keyPrefix}-${start}`;
    if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const linkText = linkMatch[1] ?? '';
        const linkHref = linkMatch[2] ?? '#';
        nodes.push(
          <a
            key={tokenKey}
            href={sanitizeHref(linkHref)}
            className="text-primary underline decoration-primary/35 underline-offset-2 hover:text-primary/80"
            rel="noreferrer noopener"
            target={linkHref.startsWith('http') ? '_blank' : undefined}
          >
            {parseInline(linkText, `${tokenKey}-text`)}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      nodes.push(
        <strong key={tokenKey} className="font-semibold text-foreground">
          {parseInline(token.slice(2, -2), `${tokenKey}-strong`)}
        </strong>
      );
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(
        <del key={tokenKey} className="text-muted-foreground">
          {parseInline(token.slice(2, -2), `${tokenKey}-del`)}
        </del>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      nodes.push(
        <em key={tokenKey} className="italic">
          {parseInline(token.slice(1, -1), `${tokenKey}-em`)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={tokenKey}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = start + token.length;
    match = pattern.exec(content);
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return nodes;
}

function parseBlocks(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  const readUntil = (predicate: (line: string) => boolean) => {
    const collected: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? '';
      if (predicate(current)) {
        break;
      }
      collected.push(current);
      index += 1;
    }
    return collected;
  };

  while (index < lines.length) {
    const rawLine = lines[index] ?? '';
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (horizontalRulePattern.test(line.trim())) {
      blocks.push(<hr key={`hr-${index}`} className="my-4 border-border/70" />);
      index += 1;
      continue;
    }

    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      const level = (headingMatch[1] ?? '#').length;
      const text = headingMatch[2] ?? '';
      const headingClass =
        level === 1
          ? 'text-2xl'
          : level === 2
            ? 'text-xl'
            : level === 3
              ? 'text-lg'
              : 'text-base';
      blocks.push(
        <h3
          key={`heading-${index}`}
          className={cn('font-heading font-semibold tracking-tight text-foreground', headingClass)}
        >
          {parseInline(text, `heading-${index}`)}
        </h3>
      );
      index += 1;
      continue;
    }

    if (fencePattern.test(line.trim())) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length) {
        const current = lines[index] ?? '';
        if (fencePattern.test(current.trim())) {
          break;
        }
        codeLines.push(current);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push(
        <pre
          key={`code-${index}`}
          className="overflow-x-auto rounded-xl border border-border/70 bg-muted px-3 py-2 text-sm text-foreground"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (quotePattern.test(line.trimStart())) {
      const quoteLines = readUntil(
        (current) => !current.trim() || !quotePattern.test(current.trimStart())
      ).map((current) => current.trimStart().replace(quotePattern, ''));

      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="rounded-r-xl border-l-4 border-primary/40 bg-primary/5 px-3 py-2 text-sm text-foreground/90"
        >
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={`quote-line-${quoteIndex}`}>{parseInline(quoteLine, `quote-${quoteIndex}`)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (orderedListPattern.test(line.trimStart())) {
      const listItems = readUntil(
        (current) => !current.trim() || !orderedListPattern.test(current.trimStart())
      );
      blocks.push(
        <ol
          key={`ol-${index}`}
          className="list-decimal space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground"
        >
          {listItems.map((item, itemIndex) => (
            <li key={`ol-item-${itemIndex}`}>
              {parseInline(item.replace(orderedListPattern, ''), `ol-item-${itemIndex}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (unorderedListPattern.test(line.trimStart())) {
      const listItems = readUntil(
        (current) => !current.trim() || !unorderedListPattern.test(current.trimStart())
      );
      blocks.push(
        <ul
          key={`ul-${index}`}
          className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground"
        >
          {listItems.map((item, itemIndex) => (
            <li key={`ul-item-${itemIndex}`}>
              {parseInline(item.replace(unorderedListPattern, ''), `ul-item-${itemIndex}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraphLines = readUntil(
      (current) =>
        !current.trim() ||
        headingPattern.test(current.trimStart()) ||
        orderedListPattern.test(current.trimStart()) ||
        unorderedListPattern.test(current.trimStart()) ||
        quotePattern.test(current.trimStart()) ||
        fencePattern.test(current.trimStart()) ||
        horizontalRulePattern.test(current.trim())
    );

    const paragraph = paragraphLines.join(' ').trim();
    if (paragraph) {
      blocks.push(
        <p key={`p-${index}`} className="text-sm leading-6 text-muted-foreground">
          {parseInline(paragraph, `p-${index}`)}
        </p>
      );
    }
  }

  return blocks;
}

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return <div className={cn('space-y-3', className)}>{parseBlocks(content)}</div>;
}
