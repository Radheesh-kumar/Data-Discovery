
import React, { useState } from 'react';
import { Search, BrainCircuit, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { AgentStatus, Candidate, HiringRequirements } from './types';
import { parseHiringRequest, discoverCandidates, evaluateAndRankCandidates } from './services/geminiService';
import AgentStatusIndicator from './components/AgentStatus';
import ResultsList from './components/ResultsList';
import ArchitectureDiagram from './components/ArchitectureDiagram';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [requirements, setRequirements] = useState<HiringRequirements | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError(null);
    setCandidates([]);
    setRequirements(null);
    
    try {
      // Step 1: Parsing
      setStatus(AgentStatus.PARSING);
      const parsedReqs = await parseHiringRequest(prompt);
      setRequirements(parsedReqs);

      // Step 2: Discovery
      setStatus(AgentStatus.DISCOVERING);
      const discoveryData = await discoverCandidates(parsedReqs);

      // Step 3: Evaluation & Ranking (Combined in service)
      setStatus(AgentStatus.EVALUATING);
      const rankedResults = await evaluateAndRankCandidates(parsedReqs, discoveryData);

      setCandidates(rankedResults);
      setStatus(AgentStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setError('An error occurred while the agents were processing your request. Please check your API key and network.');
      setStatus(AgentStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DevPulse <span className="text-blue-600">AI</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Ethics & TOS</a>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Ethical Discovery Mode</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input & Status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                New Hiring Sprint
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What are you looking for?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Find me 3 senior programmers with strong experience in NoSQL databases who can work with AWS."
                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-sm text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status !== AgentStatus.IDLE && status !== AgentStatus.COMPLETED && status !== AgentStatus.ERROR}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {status === AgentStatus.IDLE || status === AgentStatus.COMPLETED || status === AgentStatus.ERROR ? (
                    <>
                      <Search className="w-4 h-4" />
                      Deploy Discovery Agents
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 animate-pulse" />
                      Agents Working...
                    </>
                  )}
                </button>
              </form>
            </div>

            <AgentStatusIndicator currentStatus={status} />

            {requirements && (
              <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Parsed Parameters</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs">Target Count</span>
                    <span className="text-white text-xs font-mono">{requirements.quantity}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs">Level</span>
                    <span className="text-white text-xs font-mono">{requirements.experienceLevel}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Core Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {requirements.skills.map(s => <span key={s} className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-blue-300">{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Scaling Note:</strong> For enterprise usage, these agents can be connected to custom scrapers or vector databases of indexed candidate data. This demo uses real-time search grounding for accuracy.
              </p>
            </div>
          </div>

          {/* Right Column: Results & Info */}
          <div className="lg:col-span-2 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {status === AgentStatus.IDLE && (
              <div className="h-full flex flex-col justify-center items-center text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="text-slate-300 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready for Discovery</h2>
                <p className="text-slate-500 max-w-md">
                  Enter a hiring request on the left to activate our specialized AI agents. 
                  They will scan public sources and evaluate developers based on real project evidence.
                </p>
                <div className="mt-8 w-full">
                   <ArchitectureDiagram />
                </div>
              </div>
            )}

            {candidates.length > 0 && (
              <ResultsList candidates={candidates} />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2024 DevPulse AI Talent Sourcing. Built with Gemini 3 Flash.
          </p>
          <div className="flex gap-4 text-xs font-semibold text-slate-400">
            <span>PUBLIC DATA ONLY</span>
            <span>GDPR COMPLIANT</span>
            <span>ZERO SENSITIVE DATA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
