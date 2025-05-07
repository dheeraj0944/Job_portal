"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyJobData {
  name: string; // Month-Year e.g., "Jan 2023"
  jobs: number;  // Number of jobs posted
}

interface JobsPostedBarChartProps {
  data: MonthlyJobData[];
}

const JobsPostedBarChart: React.FC<JobsPostedBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground">No monthly posting data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="jobs" fill="#8884d8" name="Jobs Posted" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default JobsPostedBarChart; 