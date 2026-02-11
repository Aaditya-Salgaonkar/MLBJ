import React from 'react';
import { Scale, Gavel, FileText, Lock, ArrowRight, User, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function MLBJLandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-800">
      {/* Navigation */}
      <nav className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <Scale size={24} />
          </div>
          <span className="text-xl font-bold text-slate-900 leading-tight">
            ML Based <br /> Judiciary System
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#" className="hover:text-[#A03623] transition-colors">Home</a>
          <a href="#" className="hover:text-[#A03623] transition-colors">Services</a>
          <a href="#" className="hover:text-[#A03623] transition-colors">About</a>
          <a href="#" className="hover:text-[#A03623] transition-colors">Contact us</a>
        </div>

        <Link href="/auth/login" className="bg-[#A03623] hover:bg-[#8a2e1e] text-white px-4 py-2 rounded-lg font-semibold text-md transition-colors">
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-[#A03623] font-bold tracking-wide text-sm uppercase">
              <Gavel size={16} />
              <span>Justice Made Intelligent</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1]">
              AI-Driven Judiciary <br />
              <span className="text-[#A03623]">Service Portal</span>
            </h1>
            
            <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
              Welcome to the AI-Driven Judiciary Service Portal — now enhanced with advanced AI-powered legal intelligence tools that support citizens, advocates, and courts with faster, smarter legal insights. 
            </p>

            <div className="flex items-center gap-4 text-sm font-bold text-[#A03623] tracking-wide">
              <span>Justice</span>
              <span className="w-1 h-1 bg-[#A03623] rounded-full"></span>
              <span>Transparency</span>
              <span className="w-1 h-1 bg-[#A03623] rounded-full"></span>
              <span>Intelligence</span>
            </div>
            
            <div className="h-px bg-slate-300 w-full max-w-md"></div>

            <div className="flex flex-wrap gap-4">
              <button className="bg-[#A03623] hover:bg-[#8a2e1e] text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-[#A03623]/20 transition-all">
                Get Started
              </button>
              <button className="bg-transparent border-2 border-[#A03623] text-[#A03623] px-8 py-3 rounded-lg font-bold hover:bg-[#A03623] hover:text-white transition-all">
                Learn more
              </button>
            </div>
          </div>

          {/* Hero Image & Floating Cards */}
          <div className="relative mt-8 lg:mt-0">
            {/* Main Image */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
              <img 
                src="/image.png" 
                alt="Gavel on sound block" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Floating Card 1: Outcome Predictor (Bottom Left) */}
            <div className="absolute -bottom-6 left-0 md:-left-8 bg-white p-4 rounded-xl shadow-xl max-w-[200px] flex flex-col items-center text-center border border-slate-100">
              <div className="mb-2 text-slate-800">
                <Lock size={28} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Case Outcome Predictor</h3>
              <p className="text-[10px] text-slate-500 mt-1">Upload case summary to receive predictive insight</p>
            </div>

            {/* Floating Card 2: Judgments Retrieval (Bottom Right) */}
            <div className="absolute -bottom-6 right-0 md:right-8 bg-white p-4 rounded-xl shadow-xl max-w-[180px] flex flex-col items-center text-center border border-slate-100">
              <div className="mb-2 text-slate-800">
                <Scale size={28} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Judgments Retrieval</h3>
              <p className="text-[10px] text-slate-500 mt-1">Instantly retrieve precedent judgments with high similarity</p>
            </div>

            {/* Floating Card 3: AI Summarizer (Top Right) */}
            <div className="absolute top-12 right-0 md:-right-6 bg-white p-4 rounded-xl shadow-xl max-w-[160px] flex flex-col items-center text-center border border-slate-100">
              <div className="mb-2 text-slate-800">
                <FileText size={28} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI Case Summarizer</h3>
              <p className="text-[10px] text-slate-500 mt-1">Tool for advocates and judges</p>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="bg-[#F5F5F5] py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8D4D1] text-[#A03623] font-bold text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-[#A03623]"></div>
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Comprehensive Legal & AI-Driven Judicial Services
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <ServiceCard 
              title="Court Registry"
              description="Register and manage cases with enhanced AI insights."
              features={[
                "Case classification",
                "Smart document interpretation",
                "Online records access"
              ]}
            />
             {/* Service Card 2 */}
            <ServiceCard 
              title="Judgment Analysis"
              description="Submit legal documents with intelligent validation."
              features={[
                "Digital Filing",
                "AI Section Tagging",
                "Document Parsing",
                "Instant Confirmation"
              ]}
            />
             {/* Service Card 3 */}
            <ServiceCard 
              title="Legal Assistant"
              description="Register and manage cases with enhanced AI insights."
              features={[
                "Case classification",
                "Smart document interpretation",
                "Status tracking",
                "Online records access"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>&copy; 2026 ML Based Judiciary System. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Sub-component for Service Cards
function ServiceCard({ title, description, features }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="h-48 bg-gray-200 w-full relative group">
         {/* Placeholder for card image */}
         <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-sm font-medium uppercase tracking-wider">Image Placeholder</span>
         </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          {description}
        </p>
        <ul className="space-y-2 mb-8 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-500 font-medium">
              <span className="mt-1 w-1 h-1 bg-slate-400 rounded-full flex-shrink-0"></span>
              {feature}
            </li>
          ))}
        </ul>
        <button className="w-full bg-[#A03623] hover:bg-[#8a2e1e] text-white py-3 rounded-lg font-bold text-sm transition-colors mt-auto">
          Register now
        </button>
      </div>
    </div>
  );
}