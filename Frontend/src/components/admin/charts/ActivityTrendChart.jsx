import { memo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import EmptyChart from './EmptyChart';

const SERIES = [
  { key: 'enquiries', label: 'Enquiries', color: '#2f7c42' },
  { key: 'tripRequests', label: 'Trip requests', color: '#ffba43' },
  { key: 'contactRequests', label: 'Contact requests', color: '#8b5cf6' },
];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e6ebe7',
  boxShadow: '0 10px 28px -12px rgba(15, 60, 30, 0.2)',
  fontSize: 12,
};

export default memo(function ActivityTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No activity in the last 12 months yet." />;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6ebe7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#5b6b5f' }}
            tickLine={false}
            axisLine={{ stroke: '#a3aea6' }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#5b6b5f' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#5b6b5f' }}
            iconType="circle"
            iconSize={8}
          />
          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#gradient-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
