import { vscForeground } from "..";

interface MangoLogoProps {
  height?: number;
  width?: number;
}

export default function MangoLogo({
  height = 987,
  width = 299,
}: MangoLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 987 299"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="mangoLogoGradient"
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
      <circle cx="150" cy="150" r="130" fill="url(#mangoLogoGradient)" />
      <text
        x="330"
        y="150"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="180"
        fontWeight="600"
        fill={vscForeground}
      >
        Mango
      </text>
    </svg>
  );
}
