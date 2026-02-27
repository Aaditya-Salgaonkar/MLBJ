"use client";

// Note: You will need to install recharts: npm install recharts
import React from "react";
import Sidebar from "../../components/Sidebar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Mock Data ---
const kpiData = [
  { title: "Total Cases", value: "24,592", trend: "+12.5%", isPositive: true },
  { title: "Active Pending", value: "3,104", trend: "-2.4%", isPositive: true },
  { title: "Clearance Rate", value: "94.2%", trend: "+1.1%", isPositive: true },
  { title: "Avg. Processing", value: "45 Days", trend: "+5 Days", isPositive: false },
];

const trendData = [
  { month: "Jan", filed: 400, resolved: 240 },
  { month: "Feb", filed: 300, resolved: 139 },
  { month: "Mar", filed: 200, resolved: 980 },
  { month: "Apr", filed: 278, resolved: 390 },
  { month: "May", filed: 189, resolved: 480 },
  { month: "Jun", filed: 239, resolved: 380 },
  { month: "Jul", filed: 349, resolved: 430 },
];

const distributionData = [
  { name: "Criminal", value: 400 },
  { name: "Civil", value: 300 },
  { name: "Family", value: 300 },
  { name: "Corporate", value: 200 },
];

const COLORS = ["#dc5c45", "#A03623", "#9c2c18", "#f87171"];

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                System Overview
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time ML insights and judicial processing metrics.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
              Download Report
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full -z-0" />
                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {kpi.title}
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-black text-slate-900">
                      {kpi.value}
                    </p>
                    <span
                      className={`text-sm font-bold ${
                        kpi.isPositive ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {kpi.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Area Chart - Spans 2 columns */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Case Resolution Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Monthly comparison of filed vs resolved cases.
                </p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#slate-300" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#slate-300" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc5c45" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#dc5c45" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="filed"
                      stroke="#94a3b8"
                      fillOpacity={1}
                      fill="url(#colorFiled)"
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      stroke="#dc5c45"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorResolved)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Spans 1 column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Case Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Breakdown by category.
                </p>
              </div>
              <div className="flex-1 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {distributionData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs font-semibold text-slate-600">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}