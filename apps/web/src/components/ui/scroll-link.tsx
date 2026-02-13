'use client';

import type { MouseEvent, ReactNode } from 'react';

type ScrollLinkProps = {
  targetId: string;
  children: ReactNode;
  className?: string;
};

export function ScrollLink({ targetId, children, className }: ScrollLinkProps) {
  const href = `#${targetId}`;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
  };

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
