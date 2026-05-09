export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto bg-bg min-h-screen shadow-xl shadow-black/5">
        {/* Skeleton header */}
        <div className="relative w-full bg-muted/20" style={{ paddingBottom: '56.25%' }} />

        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-border/40 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 bg-border/40 rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-border/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Skeleton category nav */}
        <div className="flex gap-2 px-5 py-3 border-b border-border/50">
          {[80, 64, 72, 56].map((w) => (
            <div key={w} className="h-7 rounded-lg bg-border/30 animate-pulse flex-shrink-0" style={{ width: w }} />
          ))}
        </div>

        {/* Skeleton products */}
        <div className="px-5 py-5 space-y-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-28 bg-border/40 rounded-lg animate-pulse" />
              <div className="space-y-4">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="h-4 rounded-lg animate-pulse bg-border/40" style={{ width: `${60 + (j * 15)}%` }} />
                      <div className="h-3 rounded-lg animate-pulse bg-border/25" style={{ width: `${40 + (j * 10)}%` }} />
                      <div className="h-3.5 w-12 rounded-lg animate-pulse bg-border/30" />
                    </div>
                    {j % 2 === 0 && (
                      <div className="w-[72px] h-[72px] rounded-xl bg-border/30 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
