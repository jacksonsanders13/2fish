// Shows while a dashboard page loads its data, so a tap never looks like nothing happened.
export default function Loading() {
  return (
    <div className="min-h-dvh bg-surface" aria-busy="true">
      <div className="h-16 bg-night" />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <p className="sr-only" role="status">
          Loading…
        </p>
        <div className="h-8 w-64 rounded-md bg-line motion-safe:animate-pulse" />
        <div className="h-40 rounded-lg bg-white" />
        <div className="h-40 rounded-lg bg-white" />
      </div>
    </div>
  );
}
