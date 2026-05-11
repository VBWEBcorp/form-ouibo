export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="h-1 w-full rounded-full overflow-hidden"
      style={{ background: "rgba(26, 44, 69, 0.06)" }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background:
            "linear-gradient(90deg, var(--vb-primary) 0%, var(--vb-accent) 100%)",
        }}
      />
    </div>
  );
}
