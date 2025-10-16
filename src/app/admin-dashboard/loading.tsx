export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-900" />
        <p className="text-sm font-mono text-zinc-600">
          Loading admin dashboard...
        </p>
      </div>
    </div>
  );
}
