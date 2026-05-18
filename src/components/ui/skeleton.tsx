export function SkeletonRows() {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 px-4 py-4">
          {Array.from({ length: 5 }).map((__, cellIndex) => (
            <div key={cellIndex} className="h-4 animate-pulse rounded bg-white/10" />
          ))}
        </div>
      ))}
    </div>
  );
}
