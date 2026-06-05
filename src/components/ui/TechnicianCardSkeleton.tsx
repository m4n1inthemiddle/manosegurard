export default function TechnicianCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
      </div>
      <div className="px-5 pb-5">
        <div className="h-10 rounded-xl bg-slate-200" />
      </div>
    </div>
  )
}
