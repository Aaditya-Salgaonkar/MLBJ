"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

// --- Mock Data ---
const historyData = [
  {
    id: "CASE-2023-8912",
    title: "State of Maharashtra vs. Rohan Verma",
    date: "Oct 24, 2023",
    prediction: "Guilty",
    confidence: "90%",
    summary: "On March 12, 2023, Rohan Verma allegedly attempted to purchase a laptop in Pune using a forged cheque, which he tried to flee with after the shop owner questioned the discrepancies. CCTV footage confirms the incident, leading to his apprehension and a police FIR for cheating and forgery.",
    ipcSections: [
      { code: "IPC 420", title: "Cheating and dishonestly inducing delivery of property", desc: "Main charge for attempting to purchase a laptop with a forged cheque." },
      { code: "IPC 463", title: "Forged document", desc: "Charges related to the forged bank cheque." }
    ],
    similarJudgments: [
      { match: "87%", title: "State of Maharashtra vs. Bharat Fakira Dhiwar", year: "2002", desc: "Case involving similar circumstances with conviction." }
    ]
  },
  {
    id: "CASE-2023-8805",
    title: "Priya Desai vs. Rajesh Desai",
    date: "Oct 21, 2023",
    prediction: "Settlement",
    confidence: "75%",
    summary: "A civil dispute regarding the partition of ancestral property in Mumbai. The plaintiff claims a 50% share based on recent amendments to the Hindu Succession Act, while the defendant argues the property was willed entirely to him.",
    ipcSections: [],
    similarJudgments: [
      { match: "92%", title: "Vineeta Sharma vs. Rakesh Sharma", year: "2020", desc: "Supreme Court ruling on daughters' coparcenary rights." },
      { match: "81%", title: "Prakash vs. Phulavati", year: "2015", desc: "Earlier interpretation of the Hindu Succession (Amendment) Act." }
    ]
  },
  {
    id: "CASE-2023-8750",
    title: "Union of India vs. TechCorp Solutions",
    date: "Oct 15, 2023",
    prediction: "Liable",
    confidence: "82%",
    summary: "Corporate tax evasion case where the defendant allegedly used shell companies to route funds offshore. The prosecution relies on forensic accounting reports and whistleblower testimonies.",
    ipcSections: [
      { code: "Section 276C", title: "Income Tax Act", desc: "Wilful attempt to evade tax." }
    ],
    similarJudgments: [
      { match: "88%", title: "McDowell and Co. Ltd. vs. CTO", year: "1985", desc: "Landmark case on tax avoidance vs. tax evasion." }
    ]
  }
];

export default function HistoryPage() {
  const [selectedCase, setSelectedCase] = useState<typeof historyData[0] | null>(null);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Analysis History
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Review past ML predictions and historical case analyses.
              </p>
            </div>
            {selectedCase && (
              <button 
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-200/50 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <span>&larr;</span> Back to List
              </button>
            )}
          </div>

          {!selectedCase ? (
            /* Master List View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Case Reference</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Analyzed</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">ML Prediction</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyData.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCase(item)}
                    >
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.id}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                        {item.date}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md border ${
                            item.prediction === 'Guilty' || item.prediction === 'Liable'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {item.prediction}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {item.confidence}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-sm font-bold text-[#dc5c45] opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Detail View */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Title & Summary */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md border border-slate-200">
                      {selectedCase.id}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Analyzed on {selectedCase.date}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-4">{selectedCase.title}</h2>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#dc5c45]"></span>
                      AI-Generated Summary
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedCase.summary}
                    </p>
                  </div>
                </div>

                {/* Prediction Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0 ${
                    selectedCase.prediction === 'Guilty' || selectedCase.prediction === 'Liable'
                      ? 'bg-gradient-to-bl from-red-50 to-transparent'
                      : 'bg-gradient-to-bl from-emerald-50 to-transparent'
                  }`} />
                  <div className="relative z-10 w-full">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                      Predicted Outcome
                    </h3>
                    <div className={`inline-block px-6 py-2 font-black text-2xl rounded-xl mb-4 border ${
                       selectedCase.prediction === 'Guilty' || selectedCase.prediction === 'Liable'
                       ? 'bg-red-100 text-red-700 border-red-200'
                       : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {selectedCase.prediction}
                    </div>
                    <div className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                      <span className="text-sm font-semibold text-slate-600">Model Confidence</span>
                      <span className="text-lg font-black text-slate-900">{selectedCase.confidence}</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* IPC Sections */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Relevant Legal Sections</h3>
                  {selectedCase.ipcSections.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCase.ipcSections.map((ipc, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md mb-1.5">
                            {ipc.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800">{ipc.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{ipc.desc}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No specific penal sections identified in this analysis.</p>
                  )}
                </div>

                {/* Similar Past Judgments */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Similar Past Judgments</h3>
                  <div className="space-y-3">
                    {selectedCase.similarJudgments.map((caseItem, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex gap-4">
                        <div className="flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-sm">
                          {caseItem.match}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-800">{caseItem.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 border border-slate-200 rounded">
                              {caseItem.year}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{caseItem.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}