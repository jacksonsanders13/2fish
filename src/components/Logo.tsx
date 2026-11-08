// Same drawing as assets/logo.svg, as a component so we can recolor it
// (white in the top bar, category color on each post card).

function Fish({ transform }: { transform: string }) {
  return (
    <g transform={transform} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
      <path d="M46 20 L45 7 L68 17 Z" />
      <path d="M48 41 L45 53 L66 43 Z" />
      <path d="M30 30 L11 16 L18 30 L11 44 Z" />
      <path d="M30 30 C42 13 72 10 94 30 C72 50 42 47 30 30 Z" />
      <path d="M74 16 Q67 30 74 44" fill="none" />
      <circle cx="83" cy="28" r="1.6" strokeWidth={3.6} />
    </g>
  );
}

export default function Logo({ size = 32, fill = "#fff", stroke = "#14212b" }: { size?: number; fill?: string; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill={fill} stroke={stroke} aria-hidden="true">
      <Fish transform="translate(9,8) scale(.88)" />
      <Fish transform="translate(111,60) scale(-.88,.88)" />
    </svg>
  );
}
