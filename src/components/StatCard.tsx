// src/components/StatCard.tsx
export default function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-blue-100 p-6 text-center shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase text-blue-700">
        {title}
      </p>
      <p className="text-5xl font-bold text-blue-900">{value}</p>
    </div>
  );
}
