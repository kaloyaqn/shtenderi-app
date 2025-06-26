"use client";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

export default function DashboardStatsChart({ data }) {
  return (
    <ChartContainer id="dashboard-bar" config={{}} className="h-64">
      <BarChart width={500} height={250} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
} 