export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span
        className="rounded-2xl bg-maroon px-3 py-1 font-display font-black tracking-tight text-bone"
        style={{ fontSize: "1.5em" }}
      >
        BlakBod
      </span>
      <span className="mb-0.5 inline-block h-[0.22em] w-[0.22em] rounded-full bg-bone" />
    </div>
  );
}
