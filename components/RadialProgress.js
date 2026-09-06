"use client";

// Small reusable SVG ring: used for the agent's routing confidence and the
// 21-day redressal clock. Pure presentation — callers own the numbers.
export default function RadialProgress({
  value, // 0..1
  size = 56,
  strokeWidth = 5,
  color = "#1e4d3a",
  track = "rgba(27,36,31,0.1)",
  children,
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value || 0));
  const offset = c - clamped * c;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={strokeWidth} fill="none" className="radial-progress-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="radial-progress-arc"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
