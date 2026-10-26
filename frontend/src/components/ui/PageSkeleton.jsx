/** Loading placeholder used by React.lazy for workspace routes. */
export function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <div className="h-16 border-b border-line bg-white/5 backdrop-blur-md" />
      <div className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-8 w-64" />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="skeleton h-40 lg:col-span-2" />
          <div className="skeleton h-40" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
        <div className="skeleton h-64" />
      </div>
    </div>
  );
}
