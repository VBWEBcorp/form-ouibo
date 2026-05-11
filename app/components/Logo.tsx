export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://i.ibb.co/Y408rXy2/Logo-OUIBO-removebg-preview.png"
        alt="Ouibo"
        className="h-7 w-auto"
      />
    </div>
  );
}
