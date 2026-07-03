interface MangoSignetProps {
  /** Height of the signet in pixels */
  height?: number;
  /** Width of the signet in pixels */
  width?: number;
  /** Additional CSS classes to apply to the SVG */
  className?: string;
}

/**
 * The Mango signet/logo symbol without text
 */
export default function MangoSignet({
  height = 103,
  width = 107,
  className = "",
}: MangoSignetProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 106.67 103.11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="mangoSignetGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="45%" stopColor="#FF7A32" />
          <stop offset="75%" stopColor="#F4511E" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>
      </defs>
      <circle cx="53.33" cy="51.56" r="50" fill="url(#mangoSignetGradient)" />
    </svg>
  );
}
