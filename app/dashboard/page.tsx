"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";
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

const COLORS = ["#dc5c45", "#A03623", "#9c2c18", "#f87171"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([
    { title: "AI Clearance Efficiency", value: "0%", trend: "Live Tracking", isPositive: true },
    { title: "High-Confidence Rulings", value: "0", trend: "Threshold >80%", isPositive: true },
    { title: "Avg Citation Density", value: "0.0", trend: "References / Case", isPositive: true },
    { title: "Total Corpus Audited", value: "0 characters", trend: "Token Volume", isPositive: true },
  ]);

  const [strainData, setStrainData] = useState<any[]>([]);
  const [statuteDistribution, setStatuteDistribution] = useState<any[]>([]);

  useEffect(() => {
    const computeJudicialAnalytics = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data, error } = await supabase
        .from("search_history")
        .select("created_at, query_text, results_output")
        .eq("user_id", authData.user.id);

      if (data && !error) {
        const totalEvaluations = data.length;
        let highConfidenceCount = 0;
        let totalCitationsCount = 0;
        let totalCharacterVolume = 0;

        const timelineAggregation: { [key: string]: { inputStrain: number; citationLoad: number } } = {};
        const statuteClusterMap: { [key: string]: number } = {};

        data.forEach((row) => {
          const payload = row.results_output || {};
          const prediction = payload.prediction || {};
          const summary = payload.summary || {};
          
          // 1. Calculate Workflow Load & KPI Aggregates
          const inputLength = row.query_text?.length || 0;
          totalCharacterVolume += inputLength;

          if (prediction.confidence && prediction.confidence >= 0.8) {
            highConfidenceCount++;
          }

          const citations = summary.IPC_Sections || [];
          totalCitationsCount += citations.length;

          // 2. Compute Pipeline Strain Timeline (Text Volatility vs Vector Citation Returns)
          const date = new Date(row.created_at);
          const timeLabel = date.toLocaleString("en-US", { month: "short", day: "numeric" });
          
          if (!timelineAggregation[timeLabel]) {
            timelineAggregation[timeLabel] = { inputStrain: 0, citationLoad: 0 };
          }
          // Convert characters to approximate Kilotokens for processing visualization
          timelineAggregation[timeLabel].inputStrain += Math.round(inputLength / 100); 
          timelineAggregation[timeLabel].citationLoad += citations.length;

          // 3. Extract Deep Statutory Structural Groups
          if (citations.length === 0) {
            statuteClusterMap["General / Unclassified"] = (statuteClusterMap["General / Unclassified"] || 0) + 1;
          } else {
            citations.forEach((citationStr: string) => {
              let clusterName = "Other Enactments";
              const textLower = citationStr.toLowerCase();
              
              if (textLower.includes("390") || textLower.includes("392") || textLower.includes("robbery") || textLower.includes("theft")) {
                clusterName = "Property Offenses (IPC 390/392)";
              } else if (textLower.includes("138") || textLower.includes("cheque") || textLower.includes("negotiable")) {
                clusterName = "Financial Faults (NI Act 138)";
              } else if (textLower.includes("420") || textLower.includes("cheating") || textLower.includes("forgery")) {
                clusterName = "Fraud / White Collar (IPC 420)";
              } else if (textLower.includes("constitution") || textLower.includes("writ")) {
                clusterName = "Constitutional Mandates";
              }
              
              statuteClusterMap[clusterName] = (statuteClusterMap[clusterName] || 0) + 1;
            });
          }
        });

        const efficiencyRatio = totalEvaluations > 0 ? ((highConfidenceCount / totalEvaluations) * 100).toFixed(1) : "0.0";
        const averageCitations = totalEvaluations > 0 ? (totalCitationsCount / totalEvaluations).toFixed(1) : "0.0";
        
        // Format String Bounds for Corpus Readability
        const formattedVolume = totalCharacterVolume > 1000000 
          ? `${(totalCharacterVolume / 1000000).toFixed(1)}M chars` 
          : `${Math.round(totalCharacterVolume / 1000).toLocaleString()}K chars`;

        setKpis([
          { title: "AI Clearance Efficiency", value: `${efficiencyRatio}%`, trend: "High Confidence Rate", isPositive: true },
          { title: "High-Confidence Rulings", value: highConfidenceCount.toLocaleString(), trend: "Vector Matches >= 80%", isPositive: true },
          { title: "Avg Citation Density", value: averageCitations, trend: "Statutes Checked / Brief", isPositive: true },
          { title: "Total Corpus Audited", value: formattedVolume, trend: "Aggregated Text Volume", isPositive: true },
        ]);

        // Map Timelines ordered chronologically
        const formattedStrain = Object.keys(timelineAggregation).map((day) => ({
          day,
          inputStrain: timelineAggregation[day].inputStrain,
          citationLoad: timelineAggregation[day].citationLoad,
        })).slice(-10); // Capture recent 10 active diagnostic days

        setStrainData(formattedStrain.length ? formattedStrain : [{ day: "No Operations", inputStrain: 0, citationLoad: 0 }]);

        const formattedDistribution = Object.keys(statuteClusterMap).map((key) => ({
          name: key,
          value: statuteClusterMap[key],
        }));
        setStatuteDistribution(formattedDistribution.length ? formattedDistribution : [{ name: "No Enforcements Logged", value: 1 }]);
      }
      setLoading(false);
    };

    computeJudicialAnalytics();
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Strategic analytical review tracking algorithmic payload strain, pipeline volatility, and cross-reference indices.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
              Export Docket Diagnostics
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96 text-sm font-semibold text-slate-400">
              Compiling deep system analytics...
            </div>
          ) : (
            <>
              {/* Specialized KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, index) => (
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
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                        <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Display Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Strain Processing Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">System Data Load vs Citation Mapping</h3>
                    <p className="text-xs text-slate-500">Compares raw case file token input strain against cross-referenced statutory rules indexed.</p>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={strainData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorStrain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCitations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc5c45" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#dc5c45" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }} />
                        <Area type="monotone" dataKey="inputStrain" name="Text Mass Index (x100)" stroke="#a6b3c2" strokeWidth={2} fillOpacity={1} fill="url(#colorStrain)" />
                        <Area type="monotone" dataKey="citationLoad" name="Statutes Isolated" stroke="#dc5c45" strokeWidth={3} fillOpacity={1} fill="url(#colorCitations)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Substantive Statute Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Core Act Breakdown</h3>
                    <p className="text-xs text-slate-500">Distribution frequency of specific legal classification frameworks audited.</p>
                  </div>
                  <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statuteDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={82}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {statuteDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Dynamic Metric Grid Legend */}
                  <div className="grid grid-cols-1 gap-2 mt-4 max-h-[110px] overflow-y-auto pt-2 border-t border-slate-100">
                    {statuteDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-semibold text-slate-600 truncate">{entry.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-400 shrink-0">{entry.value} hits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}