export function NewsCardSkeleton() {
  return (
    <div className="animate-pulse border border-line bg-white" aria-hidden="true">
      <div className="aspect-[16/9] bg-wash" />
      <div className="space-y-4 p-5 sm:p-6">
        <div className="h-3 w-24 bg-wash" />
        <div className="h-5 w-full bg-wash" />
        <div className="h-5 w-4/5 bg-wash" />
        <div className="h-4 w-full bg-wash" />
        <div className="h-4 w-3/4 bg-wash" />
      </div>
    </div>
  );
}
