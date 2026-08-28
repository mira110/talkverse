export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-light-border ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-light-card border border-light-border rounded-2xl p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="pt-4 flex justify-between items-center">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}