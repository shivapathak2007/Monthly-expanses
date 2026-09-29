import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import formatCurrency from '../utils/formatCurrency.js';

export const NeedsWantsChart = ({ needsVsWants, currency = 'INR' }) => {
  if (!needsVsWants || (needsVsWants.needsAmount === 0 && needsVsWants.wantsAmount === 0)) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        <p>No Needs vs Wants data yet</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Needs', value: needsVsWants.needsAmount, percentage: needsVsWants.needsPercentage, color: '#10B981' },
    { name: 'Wants', value: needsVsWants.wantsAmount, percentage: needsVsWants.wantsPercentage, color: '#8B5CF6' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs">
          <p className="font-bold">{data.name}</p>
          <p className="text-slate-300">
            {formatCurrency(data.value, currency)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <div>
            <p className="text-xs font-semibold text-slate-700">Needs (Essentials)</p>
            <p className="text-xs font-bold text-emerald-600">
              {formatCurrency(needsVsWants.needsAmount, currency)} ({needsVsWants.needsPercentage}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <div>
            <p className="text-xs font-semibold text-slate-700">Wants (Discretionary)</p>
            <p className="text-xs font-bold text-purple-600">
              {formatCurrency(needsVsWants.wantsAmount, currency)} ({needsVsWants.wantsPercentage}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedsWantsChart;
