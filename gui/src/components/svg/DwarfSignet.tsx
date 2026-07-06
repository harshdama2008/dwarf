interface DwarfSignetProps {
  /** Height of the signet in pixels */
  height?: number;
  /** Width of the signet in pixels */
  width?: number;
  /** Additional CSS classes to apply to the SVG */
  className?: string;
}

/**
 * The Dwarf signet/logo symbol without text: a white line-art dwarf, pointed
 * hat and pickaxe over the shoulder, walking, on a solid black badge.
 */
export default function DwarfSignet({
  height = 100,
  width = 100,
  className = "",
}: DwarfSignetProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="14" fill="#000000" />
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
    </svg>
  );
}
