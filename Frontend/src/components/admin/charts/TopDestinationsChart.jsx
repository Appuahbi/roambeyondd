import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import EmptyChart from './EmptyChart';

const COLORS = ['#2f7c42', '#3f9953', '#67b678', '#9ad3a5'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e6ebe7',
  boxShadow: '0 10px 28px -12px rgba(15, 60, 30, 0.2)',
  fontSize: 12,
};

export default memo(function TopDestinationsChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No destination data yet." />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#5b6b5f' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="_id"
            width={110}
            tick={{ fontSize: 11, fill: '#5b6b5f' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(15, 60, 30, 0.04)' }}
            contentStyle={tooltipStyle}
            formatter={(value) => [value, 'Enquiries']}
          />
          <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
