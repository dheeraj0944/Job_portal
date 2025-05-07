"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ApplicationStatusSegment {
  name: string;
  value: number;
  fill: string; // Color for this segment
}

interface ApplicationStatusPieChartProps {
  data: ApplicationStatusSegment[];
}

const ApplicationStatusPieChart: React.FC<ApplicationStatusPieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground">No application status data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          // label={(entry) => `${entry.name} (${entry.value})`}
          outerRadius={80}
          fill="#8884d8" // Default fill, overridden by Cell
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ApplicationStatusPieChart; 