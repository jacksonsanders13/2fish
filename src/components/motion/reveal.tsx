export const ease = [0.21, 0.47, 0.32, 0.98] as const;

type Tag = "div" | "li" | "section" | "span" | "p";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before starting. Only used with `immediate`. */
  delay?: number;
  /** Kept so older call sites still compile. The rise distance is set in CSS now. */
  y?: number;
  x?: number;
  duration?: number;
  /** Rise in on load. For the top of a screen only. */
  immediate?: boolean;
  as?: Tag;
};

// Top-of-screen pieces rise in with the CSS .rise animation (globals.css), which
// runs without JavaScript and is off under Reduce Motion. Everything else is
// simply there. Nothing waits on JavaScript to become visible.
export function Reveal({ children, className, delay = 0, immediate = false, as: Comp = "div" }: Props) {
  if (!immediate) return <Comp className={className}>{children}</Comp>;
  return (
    <Comp className={className ? `rise ${className}` : "rise"} style={{ "--rise-delay": `${delay}s` } as React.CSSProperties}>
      {children}
    </Comp>
  );
}
