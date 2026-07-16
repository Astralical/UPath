export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
