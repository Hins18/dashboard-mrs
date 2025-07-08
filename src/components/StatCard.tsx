// src/components/StatCard.tsx
export default function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-blue-100 p-4 text-center shadow-sm flex flex-col justify-center">
      {/* Area untuk judul diberi tinggi tetap agar sejajar */}
      <div className="h-12 flex items-center justify-center">
        <p className="text-sm font-semibold uppercase text-blue-700 leading-tight">
          {title}
        </p>
      </div>
      <p className="text-5xl font-bold text-blue-900 mt-1">{value}</p>
    </div>
  );
}