"use client";

// Flat premium hover: a small upward lift + softer shadow. No perspective,
// no rotation — kept as its own component so callers don't need to change.
export default function TiltCard({ children, className = "", ...props }) {
  return (
    <div className={`card-hover shadow-card hover:shadow-elevated ${className}`} {...props}>
      {children}
    </div>
  );
}
