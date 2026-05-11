export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <span
        className="text-xl font-semibold tracking-[0.22em]"
        style={{ color: "var(--vb-primary)" }}
      >
        VBWEB
      </span>
    </div>
  );
}
