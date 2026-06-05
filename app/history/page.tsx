"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setHistoryList(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Dashboard Control */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Analysis History
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Review past ML predictions, verified legal indexes, and comprehensive abstract history.
              </p>
            </div>
            {selectedCase && (
              <button
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2.5 bg-slate-200/50 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-300/30"
              >
                &larr; Back to Records
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 text-sm font-semibold text-slate-400">
              Loading...
            </div>
          ) : !selectedCase ? (
            /* Premium Master History Table View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Case Reference ID</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Evaluated</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Outcome Classification</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-slate-400">
                        No historical evaluations committed to the database.
                      </td>
                    </tr>
                  ) : (
                    historyList.map((item) => {
                      const payload = item.results_output || {};
                      const isAccepted = payload.prediction?.label?.toLowerCase() === "accepted" || payload.prediction?.label?.toLowerCase() === "granted";
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => setSelectedCase(item)}
                        >
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-slate-900">
                              {payload.title || "Untitled Legal Evaluation"}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{item.id}</p>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md border capitalize ${
                                  isAccepted
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-red-50 text-red-700 border-red-100"
                                }`}
                              >
                                {payload.prediction?.label || "Evaluated"}
                              </span>
                              {payload.prediction?.confidence && (
                                <span className="text-xs font-bold text-slate-400">
                                  {(payload.prediction.confidence * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-sm font-bold text-[#dc5c45] opacity-0 group-hover:opacity-100 transition-opacity">
                              View &rarr;
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Premium Historical Detail Report View */
            (() => {
              const payload = selectedCase.results_output || {};
              const summary = payload.summary || {};
              const prediction = payload.prediction || {};
              const similarCases = payload.similar_cases || [];
              const isAccepted = prediction.label?.toLowerCase() === "accepted" || prediction.label?.toLowerCase() === "granted";

              return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Abstract Content View */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded-md border border-slate-200">
                          ID: {selectedCase.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Pipeline Logs: {formatDate(selectedCase.created_at)}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {payload.title || "Untitled Evaluation Report"}
                      </h2>

                      {/* Material Facts Abstract */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-[#A03623] uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#dc5c45]"></span>
                          Material Facts Abstract
                        </h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-sm leading-relaxed">
                          {summary.Facts?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || (
                            <li className="italic text-slate-400">No baseline factual structures documented.</li>
                          )}
                        </ul>
                      </div>

                      {/* Jurisprudential Analysis Points */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Identified Legal Issues</h4>
                          <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs font-medium">
                            {summary.Issues?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>N/A</li>}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Core Court Reasoning</h4>
                          <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs font-medium">
                            {summary.Court_Reasoning?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>N/A</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Classifier Metadata Dashboard Metrics */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0 ${
                          isAccepted ? "bg-gradient-to-bl from-emerald-50 to-transparent" : "bg-gradient-to-bl from-red-50 to-transparent"
                        }`}
                      />
                      <div className="relative z-10 w-full space-y-6">
                        <div>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                            Classifier Prediction
                          </h3>
                          <div
                            className={`inline-block px-5 py-1.5 font-black text-xl rounded-xl border capitalize ${
                              isAccepted
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {prediction.label || "N/A"}
                          </div>
                        </div>

                        {prediction.confidence && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confidence Log</span>
                              <span className="text-lg font-black text-slate-900">{(prediction.confidence * 100).toFixed(1)}%</span>
                            </div>

                            {prediction.probabilities && (
                              <div className="pt-2">
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                                  <div
                                    style={{ width: `${prediction.probabilities[0] * 100}%` }}
                                    className="bg-slate-300 transition-all"
                                    title="Denied Mapping"
                                  />
                                  <div
                                    style={{ width: `${prediction.probabilities[1] * 100}%` }}
                                    className="bg-gradient-to-r from-[#dc5c45] to-[#9c2c18] transition-all"
                                    title="Granted Mapping"
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                                  <span>Denied: {(prediction.probabilities[0] * 100).toFixed(0)}%</span>
                                  <span>Granted: {(prediction.probabilities[1] * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-4 mt-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Conclusion Resolution</h4>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-serif">
                          {summary.Conclusion?.[0] || "Resolution parameter missing."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* System Verified Enforcements / Similar Citations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dynamic IPC/Statute Tags Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 mb-4 tracking-tight">Statutory Frameworks Enforced</h3>
                      {summary.IPC_Sections && summary.IPC_Sections.length > 0 ? (
                        <div className="space-y-2.5">
                          {summary.IPC_Sections.map((statute: string, idx: number) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#A03623] mt-1.5 shrink-0" />
                              <p className="text-xs font-semibold text-slate-700 leading-relaxed">{statute}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No statutory citations flagged by system indices.</p>
                      )}
                    </div>

                    {/* Vector Database Index Match Matches */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 mb-4 tracking-tight">Vector Search References ({similarCases.length})</h3>
                      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                        {similarCases.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hybrid database records attached to this logging trace.</p>
                        ) : (
                          similarCases.map((caseItem: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex gap-4 items-center">
                              <div className="flex flex-col items-center justify-center w-12 h-12 shrink-0 rounded-full bg-slate-100 border text-slate-700 font-mono font-black text-xs">
                                #{idx + 1}
                              </div>
                              <div className="overflow-hidden w-full">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="text-xs font-bold text-slate-800 truncate max-w-[70%]">
                                    {caseItem.title || "Reference Index Record"}
                                  </h4>
                                  <span className="text-[9px] font-mono font-bold text-[#dc5c45] bg-red-50/50 px-1.5 py-0.5 border border-red-100/40 rounded shrink-0">
                                    Score: {caseItem.rerank_score ? caseItem.rerank_score.toFixed(3) : "N/A"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium font-mono">
                                  No: {caseItem.case_no || "N/A"} • Jurisdiction: {caseItem.jurisdiction || "State"}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </main>
    </div>
  );
}