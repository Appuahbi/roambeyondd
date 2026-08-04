import { memo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import EmptyChart from './EmptyChart';

const COLORS = ['#2f7c42', '#ffba43', '#8b5cf6', '#0ea5e9', '#f43f5e', '#67b678', '#7d8a80'];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e6ebe7',
  boxShadow: '0 10px 28px -12px rgba(15, 60, 30, 0.2)',
  fontSize: 12,
};

export default memo(function LeadSourceDonut({ data }) {
  const rows = (data || []).filter((d) => (d.total || 0) > 0);
  const total = rows.reduce((sum, d) => sum + d.total, 0);

  if (!total) {
    return <EmptyChart message="No lead sources yet." />;
  }

  return (
    <div>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="total"
              nameKey="_id"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {rows.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, 'Leads']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-2xl font-semibold text-ink-900">{total}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-500">leads</p>
          </div>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {rows.map((d, i) => (
          <li key={d._id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-700">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="truncate">{d._id}</span>
            </span>
            <span className="shrink-0 pl-2">
              <span className="font-semibold text-ink-900">{d.total}</span>
              <span className="ml-1 text-xs text-ink-500">
                {Math.round((d.total / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
