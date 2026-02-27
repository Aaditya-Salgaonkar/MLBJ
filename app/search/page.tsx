"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function CreateCasePage() {
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzed(true);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Case Analysis Engine
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter case parameters to generate ML-based predictions and legal precedents.
              </p>
            </div>
            {isAnalyzed && (
              <button 
                onClick={() => setIsAnalyzed(false)}
                className="px-4 py-2 bg-slate-200/50 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                New Analysis
              </button>
            )}
          </div>

          {!isAnalyzed ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-6xl">
              <form onSubmit={handleAnalyze} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Case Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the case title in brief"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Case Facts & FIR Details
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Enter the details of the incident, evidence, and preliminary charges..."
                    value={caseDescription}
                    onChange={(e) => setCaseDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all resize-none"
                    required
                  ></textarea>
                </div>
                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#dc5c45] via-[#A03623] to-[#9c2c18] text-white text-sm font-bold rounded-xl shadow-md shadow-[#dc5c45]/20 hover:shadow-lg transition-all"
                  >
                    Find
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Results Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Title & Summary */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900 mb-4">{caseTitle}</h2>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#dc5c45]"></span>
                      AI-Generated Summary
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      On March 12, 2023, Rohan Verma allegedly attempted to purchase a laptop in Pune using a forged cheque, which he tried to flee with after the shop owner questioned the discrepancies. CCTV footage confirms the incident, leading to his apprehension and a police FIR for cheating and forgery, with evidence including a forged cheque, a suspected fake PAN card, and incriminating mobile phone content. The complainant seeks prosecution under relevant sections of the IPC.
                    </p>
                  </div>
                </div>

                {/* Prediction Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-50 to-transparent rounded-bl-full -z-0" />
                  <div className="relative z-10 w-full">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                      Predicted Outcome
                    </h3>
                    <div className="inline-block px-6 py-2 bg-red-100 text-red-700 font-black text-2xl rounded-xl mb-4 border border-red-200">
                      Guilty
                    </div>
                    <div className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                      <span className="text-sm font-semibold text-slate-600">Model Confidence</span>
                      <span className="text-lg font-black text-[#dc5c45]">90%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Results Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* IPC Sections */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Relevant IPC Sections</h3>
                  <div className="space-y-3">
                    {[
                      { code: "IPC 420", title: "Cheating and dishonestly inducing delivery of property", desc: "Main charge for attempting to purchase a laptop with a forged cheque." },
                      { code: "IPC 463", title: "Forged document", desc: "Charges related to the forged bank cheque." },
                      { code: "IPC 471", title: "Using as genuine a forged document", desc: "Charges for using the forged cheque." },
                      { code: "IPC 465", title: "Punishment for forgery", desc: "Direct charge for forgery of the cheque." }
                    ].map((ipc, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md mb-1.5">
                              {ipc.code}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800">{ipc.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{ipc.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Past Judgments */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Similar Past Judgments</h3>
                  <div className="space-y-3">
                    {[
                      { match: "87%", title: "State of Maharashtra vs. Bharat Fakira Dhiwar", year: "2002", desc: "Case involving similar circumstances with conviction under IPC 302." },
                      { match: "78%", title: "Sharad Birdhichand Sarda vs. State of Maharashtra", year: "1984", desc: "Established principles of circumstantial evidence in murder cases." }
                    ].map((caseItem, idx) => (
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