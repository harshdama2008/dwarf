import { vscForeground } from "..";

interface DwarfLogoProps {
  height?: number;
  width?: number;
}

export default function DwarfLogo({
  height = 987,
  width = 299,
}: DwarfLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 987 299"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="20" y="20" width="260" height="260" rx="30" fill="#000000" />
      <g transform="translate(40, 40) scale(2.2)">
        <circle cx="40" cy="26" r="7" fill="#FFFFFF" />
        <path d="M 30 22 L 50 22 L 40 6 Z" fill="#FFFFFF" />
        <g
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <line x1="40" y1="34" x2="38" y2="58" />
          <path d="M 38 58 L 28 74 L 22 90" />
          <path d="M 38 58 L 48 72 L 54 90" />
          <path d="M 40 34 L 30 46 L 24 56" />
          <path d="M 40 34 L 52 38 L 58 32" />
          <line x1="56" y1="34" x2="72" y2="14" />
          <path d="M 48 2 L 72 14 L 95 8" strokeWidth="4" />
        </g>
      </g>
      <text
        x="330"
        y="150"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="180"
        fontWeight="600"
        fill={vscForeground}
      >
        Dwarf
      </text>
    </svg>
  );
}
