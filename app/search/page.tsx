"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabase"; // Ensure this import points to your Supabase client setup

export default function JudicioDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "pdf">("text");
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");

  // Feature Toggles / Active View Control
  const [activeTab, setActiveTab] = useState<"search" | "summary" | "prediction">("search");
  const [hasProcessed, setHasProcessed] = useState(false);

  // API State data
  const [similarCases, setSimilarCases] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [predictionData, setPredictionData] = useState<any>(null);

  const extractTextFromPdf = async (file: File) => {
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    } catch (error) {
      console.error("PDF extraction failed:", error);
      alert("Failed to parse PDF file.");
      return "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setIsLoading(true);
      const text = await extractTextFromPdf(file);
      setExtractedText(text);
      setIsLoading(false);
    }
  };

  const handleProcessPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = inputMode === "text" ? caseDescription : extractedText;
    if (!finalQuery) return;
    setIsLoading(true);

    try {
      // 1. Fire Similar Cases Search Request (/retrieval)
      const searchRes = await fetch("http://127.0.0.1:8000/retrieval/search/hybrid/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery, top_k: 10 }),
      });
      const searchData = await searchRes.json();
      const fetchedCases = searchData.results || [];
      setSimilarCases(fetchedCases);

      // 2. Fire Case Summarization Request (/summarize)
      const summaryRes = await fetch("http://127.0.0.1:8000/summarize/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery }),
      });
      const summaryJson = await summaryRes.json();
      const fetchedSummary = summaryJson.result || null;
      setSummaryData(fetchedSummary);

      // 3. Fire Case Outcome Prediction Request (/predict)
      const predictRes = await fetch("http://127.0.0.1:8000/predict/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalQuery }),
      });
      const predictJson = await predictRes.json();
      setPredictionData(predictJson || null);

      setCurrentIndex(0);
      setHasProcessed(true);

      // 4. Log Entire Transaction to Supabase search_history Table
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        await supabase.from("search_history").insert({
          user_id: authData.user.id,
          query_text: finalQuery,
          results_output: {
            title: caseTitle || "Untitled Analysis",
            similar_cases: fetchedCases,
            summary: fetchedSummary,
            prediction: predictJson || null,
          },
        });
      }
    } catch (err) {
      console.error("Pipeline invocation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER SECTION */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Judicio AI Analyzer</h1>
              <p className="text-sm text-slate-500">Cross-examine queries against retrieval models, summarization systems, and outcome classifiers</p>
            </div>

            {hasProcessed && (
              <button
                onClick={() => {
                  setHasProcessed(false);
                  setSimilarCases([]);
                  setSummaryData(null);
                  setPredictionData(null);
                  setCaseTitle("");
                  setCaseDescription("");
                  setExtractedText("");
                  setFileName("");
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition"
              >
                Reset Dashboard
              </button>
            )}
          </div>

          {!hasProcessed ? (
            <form onSubmit={handleProcessPipeline} className="bg-white p-8 rounded-2xl border space-y-6 shadow-sm">
              <input
                type="text"
                placeholder="Case Title / Reference ID"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:border-slate-400 transition"
              />

              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-xs">
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${inputMode === "text" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Text Entry
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("pdf")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${inputMode === "pdf" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Case File (.PDF)
                </button>
              </div>

              {inputMode === "text" ? (
                <textarea
                  rows={6}
                  placeholder="Paste explicit case details, factual histories, or contractual terms here..."
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:border-slate-400 transition"
                  required={inputMode === "text"}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={inputMode === "pdf" && !extractedText}
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">{fileName ? fileName : "Upload raw Case litigation PDF"}</p>
                    <p className="text-xs text-slate-400 mt-1">{extractedText ? "Parsing pipeline evaluation successful" : "Accepts standalone binary documents"}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (inputMode === "text" ? !caseDescription : !extractedText)}
                className="w-full py-3 bg-gradient-to-r from-[#dc5c45] via-[#A03623] to-[#9c2c18] text-white rounded-xl font-bold tracking-wide shadow-md disabled:opacity-50 transition transform hover:scale-[1.01]"
              >
                {isLoading ? "Processing" : "Process"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              
              {/* SUB-MODULE FILTER TABS */}
              <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab("search")}
                  className={`pb-3 transition border-b-2 ${activeTab === "search" ? "border-[#A03623] text-[#A03623]" : "border-transparent text-slate-400"}`}
                >
                  Similar Cases Match ({similarCases.length})
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`pb-3 transition border-b-2 ${activeTab === "summary" ? "border-[#A03623] text-[#A03623]" : "border-transparent text-slate-400"}`}
                >
                  Gemini Structured Summary
                </button>
                <button
                  onClick={() => setActiveTab("prediction")}
                  className={`pb-3 transition border-b-2 ${activeTab === "prediction" ? "border-[#A03623] text-[#A03623]" : "border-transparent text-slate-400"}`}
                >
                  Outcome Classification Models
                </button>
              </div>

              {/* VIEWPORTS */}
              {activeTab === "search" && (
                <div className="space-y-6">
                  {similarCases.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border text-center text-slate-400">No context matches verified inside database indices.</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between bg-white p-4 border rounded-xl shadow-sm">
                        <button
                          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                          disabled={currentIndex === 0}
                          className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold disabled:opacity-40"
                        >
                          &larr; Previous Record
                        </button>
                        <span className="text-sm font-bold text-slate-600">Indexed Index Match {currentIndex + 1} of {similarCases.length}</span>
                        <button
                          onClick={() => setCurrentIndex((i) => Math.min(i + 1, similarCases.length - 1))}
                          disabled={currentIndex === similarCases.length - 1}
                          className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold disabled:opacity-40"
                        >
                          Next Record &rarr;
                        </button>
                      </div>

                      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-2xl font-black text-slate-900">{similarCases[currentIndex].title || "State Reference Record"}</h2>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono pb-4 border-b">
                          <span>CASE NO: {similarCases[currentIndex].case_no}</span>
                          <span>JURISDICTION: {similarCases[currentIndex].jurisdiction || "N/A"}</span>
                          <span>DATE EVALUATED: {similarCases[currentIndex].date || "N/A"}</span>
                          <span className="text-[#dc5c45] font-bold">RERANK SCORE: {similarCases[currentIndex].rerank_score || "N/A"}</span>
                        </div>

                        <div className="space-y-4 pt-2">
                          <Field title="Case Summary Issue Context" value={similarCases[currentIndex].issue} />
                          <Field title="Substantive Facts Outline" value={similarCases[currentIndex].facts} />
                          <Field title="Jurisprudential Reasoning" value={similarCases[currentIndex].court_reasoning} />
                          <Field title="Final Resolution Verdict" value={similarCases[currentIndex].conclusion} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "summary" && (
                <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-3">AI Case Abstract</h3>
                  {summaryData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Extracted Material Facts</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Facts?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No historical facts extracted.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Identified Jurisprudential Issues</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Issues?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No focal legal issues identified.</li>}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center py-6">Failed parsing standard case abstract files. Check authorization headers.</div>
                  )}
                </div>
              )}

              {activeTab === "prediction" && (
                <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-3">Outcome Model Probability Estimations</h3>
                  {predictionData ? (
                    <div className="max-w-md space-y-6">
                      <div className="p-6 rounded-xl border bg-slate-50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predicted Decision Label</p>
                          <p className="text-3xl font-black text-slate-900 mt-1">{predictionData.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence Index</p>
                          <p className="text-3xl font-black text-[#A03623] mt-1">{(predictionData.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Calculated Probability Threshold Weight Distribution</p>
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${predictionData.probabilities[0] * 100}%` }} 
                            className="bg-slate-400 transition-all duration-500"
                            title="Denied probability mapping weight"
                          />
                          <div 
                            style={{ width: `${predictionData.probabilities[1] * 100}%` }} 
                            className="bg-gradient-to-r from-[#dc5c45] to-[#9c2c18] transition-all duration-500"
                            title="Granted probability mapping weight"
                          />
                        </div>
                        <div className="flex justify-between text-xs font-mono text-slate-400 pt-1">
                          <span>Dismissed/Denied: {(predictionData.probabilities[0] * 100).toFixed(1)}%</span>
                          <span>Approved/Granted: {(predictionData.probabilities[1] * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center py-6">Probability parameters undefined. Confirm text token sizing thresholds.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ title, value }: { title: string; value: string }) {
  if (!value) return null;
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
      <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">{value}</p>
    </div>
  );
}