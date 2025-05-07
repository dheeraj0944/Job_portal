"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface JobCategoryData {
  name: string;
  value: number;
}

interface JobCategoryPieChartProps {
  data: JobCategoryData[];
}

// Define some colors for the pie chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];

const JobCategoryPieChart: React.FC<JobCategoryPieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground">No category data available.</p>;
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
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default JobCategoryPieChart; 