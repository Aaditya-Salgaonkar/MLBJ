"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabase"; // Ensure this import points to your Supabase client setup
import { Sparkles, CheckCircle2, XCircle, Scale, FileText, Brain, ChevronRight, AlertCircle } from "lucide-react";

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
  const [expFilter, setExpFilter] = useState<"all" | "supports" | "against">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);

    const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!rawUrl) {
      setErrorMessage("Backend URL is not set. Please specify NEXT_PUBLIC_BACKEND_URL in your .env.local file.");
      setIsLoading(false);
      return;
    }

    const BACKEND_URL = rawUrl.replace(/\/+$/, "");

    try {
      // 1. Fire Similar Cases Search Request (/retrieval)
      const searchRes = await fetch(`${BACKEND_URL}/retrieval/search/hybrid/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery, top_k: 10 }),
      });
      if (!searchRes.ok) {
        throw new Error(`Search request failed with status ${searchRes.status} (${searchRes.statusText})`);
      }
      const searchData = await searchRes.json();
      const fetchedCases = searchData.results || [];
      setSimilarCases(fetchedCases);

      // 2. Fire Case Summarization Request (/summarize)
      const summaryRes = await fetch(`${BACKEND_URL}/summarize/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery }),
      });
      if (!summaryRes.ok) {
        throw new Error(`Summarize request failed with status ${summaryRes.status} (${summaryRes.statusText})`);
      }
      const summaryJson = await summaryRes.json();
      const fetchedSummary = summaryJson.result || null;
      console.log("Fetched Summary:", summaryJson);
      setSummaryData(fetchedSummary);

      // 3. Fire Case Outcome Prediction Request (/predict)
      const predictRes = await fetch(`${BACKEND_URL}/predict/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalQuery }),
      });
      if (!predictRes.ok) {
        throw new Error(`Prediction request failed with status ${predictRes.status} (${predictRes.statusText})`);
      }
      const predictJson = await predictRes.json();
      setPredictionData(predictJson || null);

      setCurrentIndex(0);
      setHasProcessed(true);

      // 4. Log Entire Transaction to Supabase search_history Table
      try {
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
      } catch (dbErr) {
        console.error("Supabase logging failed:", dbErr);
      }
    } catch (err: any) {
      console.error("Pipeline invocation failed:", err);
      if (err?.name === "TypeError" || err?.message === "Failed to fetch") {
        setErrorMessage(
          `Failed to connect to backend at ${BACKEND_URL}. Please check if the backend server is running and accessible.`
        );
      } else {
        setErrorMessage(err?.message || "An error occurred while calling the backend pipeline.");
      }
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
                  setErrorMessage(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition"
              >
                Reset Dashboard
              </button>
            )}
          </div>

          {!hasProcessed ? (
            <form onSubmit={handleProcessPipeline} className="bg-white p-8 rounded-2xl border space-y-6 shadow-sm">
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-500 hover:text-rose-700 font-bold text-xs shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}
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
                  Similar Cases Retrieved ({similarCases.length})
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`pb-3 transition border-b-2 ${activeTab === "summary" ? "border-[#A03623] text-[#A03623]" : "border-transparent text-slate-400"}`}
                >
                  Case Summarized
                </button>
                <button
                  onClick={() => setActiveTab("prediction")}
                  className={`pb-3 transition border-b-2 ${activeTab === "prediction" ? "border-[#A03623] text-[#A03623]" : "border-transparent text-slate-400"}`}
                >
                  Case Predictions
                </button>
              </div>

              {/* VIEWPORTS */}
              {activeTab === "search" && (
                <div className="space-y-6">
                  {similarCases.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border text-center text-slate-400">
                      No context matches verified inside database indices.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Cases Sidebar List */}
                      <div className="lg:col-span-4 space-y-3 max-h-[650px] overflow-y-auto pr-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Retrieved Cases ({similarCases.length})
                        </div>
                        {similarCases.map((c, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                              currentIndex === idx
                                ? "border-[#A03623] bg-[#A03623]/5 shadow-sm"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] font-bold text-[#A03623] font-mono">
                                MATCH #{idx + 1}
                              </span>
                              {c.rerank_score !== undefined && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                                  Rerank: {typeof c.rerank_score === "number" ? c.rerank_score.toFixed(4) : c.rerank_score}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                              {c.title || "Untitled Reference Record"}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                              <span className="truncate max-w-[120px]">{c.case_no}</span>
                              <span>{c.date || "N/A"}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right: Selected Case Details Pane */}
                      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-h-[650px] overflow-y-auto">
                        <div className="flex justify-between items-start border-b pb-4">
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A03623] bg-[#A03623]/5 px-2.5 py-1 rounded-full mb-2">
                              <Scale size={13} />
                                precedent judgment
                            </span>
                            <h2 className="text-xl font-black text-slate-900 leading-snug">
                              {similarCases[currentIndex].title || "State Reference Record"}
                            </h2>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-mono mt-2">
                              <span>CASE NO: {similarCases[currentIndex].case_no}</span>
                              <span>JURISDICTION: {similarCases[currentIndex].jurisdiction || "N/A"}</span>
                              <span>DATE EVALUATED: {similarCases[currentIndex].date || "N/A"}</span>
                            </div>
                          </div>
                          {similarCases[currentIndex].rerank_score !== undefined && (
                            <div className="text-right shrink-0 bg-slate-50 border p-3 rounded-xl ml-4">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rerank Score</p>
                              <p className="text-lg font-black text-[#dc5c45] mt-0.5">
                                {typeof similarCases[currentIndex].rerank_score === "number"
                                  ? similarCases[currentIndex].rerank_score.toFixed(4)
                                  : similarCases[currentIndex].rerank_score}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Field title="Case Summary Issue Context" value={similarCases[currentIndex].issue} />
                          <Field title="Substantive Facts Outline" value={similarCases[currentIndex].facts} />
                          <Field title="Jurisprudential Reasoning" value={similarCases[currentIndex].court_reasoning} />
                          <Field title="Final Resolution Verdict" value={similarCases[currentIndex].conclusion} />
                          <Field title="IPC Sections Citations" value={similarCases[currentIndex].ipc_sections || similarCases[currentIndex].IPC_Sections} />
                          <Field title="Precedent Analysis" value={similarCases[currentIndex].precedent_analysis} />
                          <Field title="Argument by Petitioner" value={similarCases[currentIndex].argument_by_petitioner} />
                          <Field title="Argument by Respondent" value={similarCases[currentIndex].argument_by_respondent} />
                          <Field title="Statute Analysis" value={similarCases[currentIndex].statute_analysis} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "summary" && (
                <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 border-b pb-3">Case Summary</h3>
                  {summaryData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Facts</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Facts?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No historical facts extracted.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Issues</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Issues?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No focal legal issues identified.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Conclusion</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Conclusion?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No conclusion available.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">IPC Sections</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.IPC_Sections?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No focal legal issues identified.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Court Reasoning</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Court_Reasoning?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No focal legal issues identified.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Precedent Analysis</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Precedent_Analysis?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No focal legal issues identified.</li>}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-[#A03623] uppercase tracking-wider">Argument by Petitioner</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                          {summaryData.Argument_by_Petitioner?.map((item: string, idx: number) => <li key={idx}>{item}</li>) || <li>No focal legal issues identified.</li>}
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
                  <div className="flex items-center gap-3 border-b pb-4">
                    <Sparkles className="text-[#A03623]" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">Case Outcome & Explanations</h3>
                  </div>
                  {predictionData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Prediction summary card */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className={`p-6 rounded-2xl border relative overflow-hidden ${
                          predictionData.label === "accepted"
                            ? "bg-emerald-50/30 border-emerald-200"
                            : "bg-rose-50/30 border-rose-200"
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predicted Decision</p>
                              <div className="flex items-center gap-2 mt-1">
                                {predictionData.label === "accepted" ? (
                                  <CheckCircle2 className="text-emerald-600" size={24} />
                                ) : (
                                  <XCircle className="text-rose-600" size={24} />
                                )}
                                <span className={`text-2xl font-black capitalize ${
                                  predictionData.label === "accepted" ? "text-emerald-800" : "text-rose-800"
                                }`}>
                                  {predictionData.label === "accepted" ? "Granted / Accepted" : "Dismissed / Rejected"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence</p>
                              <p className={`text-2xl font-black mt-1 ${
                                predictionData.label === "accepted" ? "text-emerald-600" : "text-rose-600"
                              }`}>
                                {(predictionData.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 space-y-2 border-t pt-4 border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase">Probability Weight Distribution</p>
                            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${predictionData.probabilities[0] * 100}%` }}
                                className="bg-slate-300 transition-all duration-500"
                                title="Dismissed/Rejected probability"
                              />
                              <div
                                style={{ width: `${predictionData.probabilities[1] * 100}%` }}
                                className="bg-[#A03623] transition-all duration-500"
                                title="Granted/Accepted probability"
                              />
                            </div>
                            <div className="flex justify-between text-xs font-mono text-slate-500 pt-1">
                              <span>Dismissed: {(predictionData.probabilities[0] * 100).toFixed(1)}%</span>
                              <span>Granted: {(predictionData.probabilities[1] * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-2 leading-relaxed">
                          <p className="font-bold text-slate-700 flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-[#A03623]" />
                            Interpreting Explanations
                          </p>
                          <p>
                            The AI classifier reads the chunked case summary to identify predictive factors.
                            The confidence index represents the model's confidence in its final decision.
                          </p>
                          <p>
                            Sentence importance indicates how much the model's confidence would drop if a given sentence were excluded from the analysis.
                          </p>
                        </div>
                      </div>

                      {/* Right: Explanations list */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sentence Importance Explanations</h4>
                          {/* Filter buttons */}
                          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                            <button
                              onClick={() => setExpFilter("all")}
                              className={`px-2.5 py-1 rounded-md font-medium transition ${
                                expFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() => setExpFilter("supports")}
                              className={`px-2.5 py-1 rounded-md font-medium transition ${
                                expFilter === "supports" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-emerald-600"
                              }`}
                            >
                              Supports
                            </button>
                            <button
                              onClick={() => setExpFilter("against")}
                              className={`px-2.5 py-1 rounded-md font-medium transition ${
                                expFilter === "against" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-rose-600"
                              }`}
                            >
                              Opposes
                            </button>
                          </div>
                        </div>

                        {predictionData.explanations && predictionData.explanations.length > 0 ? (
                          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                            {predictionData.explanations
                              .filter((item: any) => expFilter === "all" || item.direction === expFilter)
                              .sort((a: any, b: any) => Math.abs(b.importance) - Math.abs(a.importance))
                              .map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-xl border transition-all ${
                                    item.direction === "supports"
                                      ? "border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/20"
                                      : "border-rose-100 bg-rose-50/10 hover:bg-rose-50/20"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{item.sentence}</p>
                                    <div className="flex flex-col items-end shrink-0 text-right">
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                          item.direction === "supports"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-rose-100 text-rose-800"
                                        }`}
                                      >
                                        {item.direction === "supports" ? "+ Supports" : "- Opposes"}
                                      </span>
                                      <span className="text-[11px] font-mono text-slate-400 mt-1.5 font-bold">
                                        Impact: {item.importance > 0 ? "+" : ""}{item.importance.toFixed(4)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {predictionData.explanations.filter((item: any) => expFilter === "all" || item.direction === expFilter).length === 0 && (
                              <div className="text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed">
                                No explanations match the active filter.
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed">
                            No sentence-level explanations generated for this input.
                          </div>
                        )}
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

function Field({ title, value }: { title: string; value: string | string[] | undefined | null }) {
  if (!value) return null;

  const isArray = Array.isArray(value);
  const hasContent = isArray ? value.length > 0 : !!value;
  if (!hasContent) return null;

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
      {isArray ? (
        <ul className="list-disc pl-5 space-y-1.5">
          {value.map((item: string, idx: number) => (
            <li key={idx} className="text-sm leading-relaxed text-slate-800">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-line">{value}</p>
      )}
    </div>
  );
}