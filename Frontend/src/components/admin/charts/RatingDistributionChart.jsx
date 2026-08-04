import { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import EmptyChart from './EmptyChart';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e6ebe7',
  boxShadow: '0 10px 28px -12px rgba(15, 60, 30, 0.2)',
  fontSize: 12,
};

const STAR_COLORS = {
  5: '#2f7c42',
  4: '#3f9953',
  3: '#ffba43',
  2: '#f59e0b',
  1: '#f43f5e',
};

export default memo(function RatingDistributionChart({ data }) {
  const rows = (data || []).filter((d) => d.total > 0);
  const total = rows.reduce((sum, d) => sum + d.total, 0);

  if (!total) {
    return <EmptyChart message="No approved reviews yet." />;
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe7" vertical={false} />
          <XAxis
            dataKey="rating"
            tick={{ fontSize: 11, fill: '#5b6b5f' }}
            tickLine={false}
            axisLine={{ stroke: '#a3aea6' }}
            tickFormatter={(r) => `${r}★`}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#5b6b5f' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, 'Reviews']} />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={28}>
            {rows.map((d) => (
              <Cell key={d.rating} fill={STAR_COLORS[d.rating] || '#9ad3a5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
