"use client";

import { trackEvent } from "@/lib/analytics";

interface Props {
  event: string;
  payload?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
}

/** Wraps any content in a div that fires an analytics event on click.
 *  Keeps parent components as server components. */
export default function TrackClick({
  event,
  payload,
  children,
  className,
}: Props) {
  return (
    <div onClick={() => trackEvent(event, payload)} className={className}>
      {children}
    </div>
  );
}
