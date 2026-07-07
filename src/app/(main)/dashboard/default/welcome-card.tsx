'use client';

export function WelcomeCard() {
  return (
    <div className="mb-2 px-4 lg:px-6">
      <div className="from-primary/[0.08] via-primary/[0.04] to-card border-primary/10 relative overflow-hidden rounded-[1.5rem] border bg-gradient-to-br p-6 md:px-10 md:py-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2.5 font-sans">
            <h4 className="text-muted-foreground/80 text-[10px] font-bold tracking-[0.2em] uppercase md:text-xs">
              Dashboard Overview
            </h4>
            <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              Welcome back, <span className="text-primary">Admin</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-xs leading-relaxed md:text-sm lg:text-base">
              Here's a snapshot of your platform activity. Monitor key metrics and take quick
              actions.
            </p>
          </div>

          <div className="border-border/50 hidden items-center gap-3 self-start rounded-full border bg-white/50 px-6 py-3 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md md:flex md:self-center dark:bg-black/20">
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-foreground/80 text-sm font-semibold tracking-wide">
              System Online
            </span>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="bg-primary/10 absolute -top-24 -right-24 size-64 animate-pulse rounded-full blur-[80px]" />
        <div className="bg-primary/5 absolute -bottom-24 -left-24 size-64 rounded-full blur-[80px]" />
      </div>
    </div>
  );
}
