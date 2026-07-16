export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
      <div className="animate-pulse">
        <div className="h-12 bg-gray-100 rounded-lg" />
      </div>
      <div className="grid gap-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
