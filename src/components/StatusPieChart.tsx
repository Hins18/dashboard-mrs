// Ganti seluruh isi file dengan kode ini

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface StatusPieChartProps {
  count: number;
  total: number;
  color: string;
  title: string;
}

export default function StatusPieChart({ count, total, color, title }: StatusPieChartProps) {
  const data = [
    { name: 'count', value: count },
    { name: 'total', value: Math.max(0, total - count) }, 
  ];

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
              isAnimationActive={total > 0} 
            >
              <Cell key="cell-0" fill={color} />
              <Cell key="cell-1" fill="#e9ecef" />
            </Pie>
            <Label
              value={`${count}`}
              position="center"
              className="fill-gray-800 text-3xl font-bold"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 font-semibold text-gray-700 text-center">{title}</p>
      <p className="text-xs text-gray-500">{`(${percentage}%) dari total`}</p>
    </div>
  );
}