// src/components/StatusPieChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface StatusPieChartProps {
  count: number;
  total: number;
  color: string;
  title: string;
}

export default function StatusPieChart({ count, total, color, title }: StatusPieChartProps) {
  // Pastikan data selalu ada agar chart tidak error, bahkan jika nilainya 0
  const data = [
    { name: 'count', value: count },
    { name: 'total', value: Math.max(0, total - count) }, 
  ];

  // Jika total 0, maka persentase juga 0 untuk menghindari NaN
  const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm bg-white h-full">
      <div style={{ width: '150px', height: '150px' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={65}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
              // *** PERBAIKAN FINAL: Animasi aktif hanya jika total data lebih dari 0 ***
              isAnimationActive={total > 0} 
            >
              <Cell key={`cell-0`} fill={color} />
              <Cell key={`cell-1`} fill="#e9ecef" />
              <Label
                value={`${count}`}
                position="center"
                className="fill-gray-800 text-3xl font-bold"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 font-semibold text-gray-700 text-center">{title}</p>
      <p className="text-xs text-gray-500">{`(${percentage}%) dari total`}</p>
    </div>
  );
}