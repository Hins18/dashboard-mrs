// src/components/UrgentTaskCard.tsx
export default function UrgentTaskCard() {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4">
      <h2 className="mb-3 text-lg font-bold">Urgent Task</h2>
      {/* Menggunakan link gambar yang valid */}
      <img
        src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=3440&auto=format&fit=crop"
        alt="Urgent Task"
        className="mb-3 h-32 w-full rounded-md object-cover"
      />
      <p className="mb-2 text-sm font-semibold">
        Monitoring of LMR Corporate Risk Profile
      </p>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-gray-600">Data sudah masuk</span>
        <span className="font-bold text-red-600">90%</span>
      </div>
      <div className="mb-3 h-1.5 w-full rounded-full bg-red-200">
        <div
          className="h-1.5 rounded-full bg-red-500"
          style={{ width: '90%' }}
        ></div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>3 Days Left</span>
        <div className="flex -space-x-2">
          <span className="h-6 w-6 rounded-full border-2 border-white bg-blue-300"></span>
          <span className="h-6 w-6 rounded-full border-2 border-white bg-green-300"></span>
          <span className="h-6 w-6 rounded-full border-2 border-white bg-yellow-300"></span>
        </div>
      </div>
    </div>
  );
}
