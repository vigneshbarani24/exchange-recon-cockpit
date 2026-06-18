export function Header({ count }: { count: number }) {
  return (
    <header className="border-b border-line bg-canvas2">
      <div className="mx-auto max-w-[1200px] px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-disp font-bold text-[1.05rem]">
            <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px] bg-tealb" />
            Exchange Recon · Ops Cockpit
          </div>
          <div className="mt-1 font-mono text-[0.7rem] tracking-[0.18em] uppercase text-muted">
            Maestro · HM Exchange · live instances
          </div>
        </div>
        <div className="font-mono text-xs text-muted">
          <span className="text-amberb font-semibold">{count}</span> awaiting review
        </div>
      </div>
    </header>
  );
}
