
import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Activity, 
  Cpu, 
  Zap, 
  Code2, 
  LineChart as LucideChart, 
  Copy, 
  Check,
  Play,
  BrainCircuit,
  Settings,
  BookOpen,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { ActiveTab, PerformanceData } from './types';
import { FLASK_SKELETON, LOCUST_SKELETON, SETUP_COMMANDS } from './constants';
import { analyzePerformance, generateCustomEndpoint, analyzeLogs } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.SETUP);
  const [copied, setCopied] = useState<string | null>(null);
  const [perfData, setPerfData] = useState<PerformanceData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [terminalLogs, setTerminalLogs] = useState('');
  const [logAnalysis, setLogAnalysis] = useState('');
  const [generatedSnippet, setGeneratedSnippet] = useState<{flask: string, locust: string} | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setPerfData(prev => {
          const newPoint = {
            timestamp: new Date().toLocaleTimeString().slice(-8),
            requests: Math.floor(Math.random() * 50) + 100 + (prev.length * 2),
            failures: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
            medianResponseTime: Math.floor(Math.random() * 50) + 120,
            p95ResponseTime: Math.floor(Math.random() * 100) + 250,
          };
          return [...prev, newPoint].slice(-20);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const metrics = JSON.stringify(perfData.slice(-5));
      const analysis = await analyzePerformance(metrics, FLASK_SKELETON, LOCUST_SKELETON);
      setAiAnalysis(analysis || "No response.");
    } catch (err) {
      setAiAnalysis("Error generating analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runLogAnalysis = async () => {
    if (!terminalLogs) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeLogs(terminalLogs);
      setLogAnalysis(analysis || "No response.");
    } catch (err) {
      setLogAnalysis("Error analyzing logs.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomGenerate = async () => {
    if (!customGoal) return;
    setIsAnalyzing(true);
    try {
      const result = await generateCustomEndpoint(customGoal);
      setGeneratedSnippet({ flask: result.flask_code, locust: result.locust_code });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="text-yellow-400 w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LoadTest Mastery
            </h1>
          </div>
          <nav className="flex space-x-1 p-1 bg-slate-800/50 rounded-lg overflow-x-auto">
            <TabButton active={activeTab === ActiveTab.SETUP} onClick={() => setActiveTab(ActiveTab.SETUP)} icon={<BookOpen className="w-4 h-4" />} label="Setup" />
            <TabButton active={activeTab === ActiveTab.GENERATOR} onClick={() => setActiveTab(ActiveTab.GENERATOR)} icon={<Code2 className="w-4 h-4" />} label="Code" />
            <TabButton active={activeTab === ActiveTab.DASHBOARD} onClick={() => setActiveTab(ActiveTab.DASHBOARD)} icon={<LucideChart className="w-4 h-4" />} label="Sim" />
            <TabButton active={activeTab === ActiveTab.AI_ADVISOR} onClick={() => setActiveTab(ActiveTab.AI_ADVISOR)} icon={<BrainCircuit className="w-4 h-4" />} label="AI Advisor" />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {activeTab === ActiveTab.SETUP && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SETUP_COMMANDS.map((s, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all">
                  <h3 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-xs text-slate-400">{idx + 1}</span>
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">{s.description}</p>
                  <div className="relative group">
                    <code className="block bg-black/40 p-3 rounded text-blue-300 text-xs font-mono">
                      {s.command}
                    </code>
                    <button 
                      onClick={() => handleCopy(s.command, `cmd-${idx}`)}
                      className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 bg-slate-800 rounded transition-all"
                    >
                      {copied === `cmd-${idx}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-400">Important: 404 Errors</h4>
                <p className="text-sm text-amber-200/80 mt-1">
                  If you see a <code className="bg-amber-900/30 px-1">404 - GET /</code> in your terminal, it means you're accessing the root URL while your app doesn't have a route defined for it. 
                  Ensure you've added the root route or access <code className="bg-amber-900/30 px-1">/api/health</code> instead.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === ActiveTab.GENERATOR && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CodePanel title="Flask API (app.py)" icon={<Cpu className="text-blue-400" />} code={FLASK_SKELETON} onCopy={() => handleCopy(FLASK_SKELETON, 'flask')} isCopied={copied === 'flask'} />
            <CodePanel title="Locust Script (locustfile.py)" icon={<Activity className="text-green-400" />} code={LOCUST_SKELETON} onCopy={() => handleCopy(LOCUST_SKELETON, 'locust')} isCopied={copied === 'locust'} />
            
            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="text-purple-400" /> Custom Endpoint Generator
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. User login with Redis caching simulation"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <button 
                  onClick={handleCustomGenerate}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              {generatedSnippet && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <SnippetView title="Generated Flask" code={generatedSnippet.flask} />
                  <SnippetView title="Generated Locust" code={generatedSnippet.locust} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === ActiveTab.DASHBOARD && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl gap-4">
              <div>
                <h2 className="text-xl font-semibold">Live Load Simulation</h2>
                <p className="text-sm text-slate-400">Visualizing hypothetical metrics for the generated scripts.</p>
              </div>
              <button 
                onClick={() => { setIsRunning(!isRunning); if(!isRunning) setPerfData([]); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold w-full sm:w-auto justify-center ${
                  isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isRunning ? <><Terminal className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start</>}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Current RPS" value={perfData.length > 0 ? perfData[perfData.length - 1].requests : 0} unit="req/s" color="text-blue-400" />
              <StatCard label="Median Latency" value={perfData.length > 0 ? perfData[perfData.length - 1].medianResponseTime : 0} unit="ms" color="text-yellow-400" />
              <StatCard label="Total Errors" value={perfData.reduce((acc, curr) => acc + curr.failures, 0)} unit="err" color="text-red-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer title="Traffic Flow">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={perfData}>
                    <defs><linearGradient id="cReq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} hide />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="requests" stroke="#60a5fa" fill="url(#cReq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer title="Latency Metrics">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={perfData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} hide />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="p95ResponseTime" stroke="#a855f7" strokeWidth={2} dot={false} name="P95" />
                    <Line type="monotone" dataKey="medianResponseTime" stroke="#facc15" strokeWidth={2} dot={false} name="Median" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}

        {activeTab === ActiveTab.AI_ADVISOR && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Analysis Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="text-blue-400" />
                  <h3 className="font-bold">Architecture Analysis</h3>
                </div>
                <p className="text-sm text-slate-400">Analyzes your current Flask and Locust scripts against simulated data.</p>
                <button 
                  onClick={runPerformanceAnalysis}
                  disabled={isAnalyzing || perfData.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-bold"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Setup"}
                </button>
                {aiAnalysis && (
                  <div className="p-4 bg-slate-800/50 rounded-lg text-sm text-slate-300 whitespace-pre-wrap border border-slate-700 overflow-y-auto max-h-[300px]">
                    {aiAnalysis}
                  </div>
                )}
              </div>

              {/* Log Troubleshooter Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="text-yellow-400" />
                  <h3 className="font-bold">Terminal Troubleshooter</h3>
                </div>
                <p className="text-sm text-slate-400">Paste your terminal logs or errors (like a 404 or connection refused) to get an instant fix.</p>
                <textarea 
                  value={terminalLogs}
                  onChange={(e) => setTerminalLogs(e.target.value)}
                  placeholder="Paste logs here... (e.g. 127.0.0.1 - - [05/Feb/2026 16:57:46] 'GET / HTTP/1.1' 404 -)"
                  className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs font-mono h-[100px] outline-none focus:ring-1 focus:ring-yellow-500"
                />
                <button 
                  onClick={runLogAnalysis}
                  disabled={isAnalyzing || !terminalLogs}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 px-4 py-2 rounded-lg font-bold text-slate-900"
                >
                  {isAnalyzing ? "Solving..." : "Troubleshoot Logs"}
                </button>
                {logAnalysis && (
                  <div className="p-4 bg-yellow-500/5 rounded-lg text-sm text-slate-300 whitespace-pre-wrap border border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500 text-xs font-bold uppercase">Solution Found</div>
                    {logAnalysis}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-8 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-xs">
          <p>© 2024 LoadTest Mastery • Powered by Google Gemini 3 Pro</p>
        </div>
      </footer>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{icon}{label}</button>
);

const CodePanel: React.FC<{ title: string, icon: React.ReactNode, code: string, onCopy: () => void, isCopied: boolean }> = ({ title, icon, code, onCopy, isCopied }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
      <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">{icon}{title}</div>
      <button onClick={onCopy} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white">{isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</button>
    </div>
    <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto h-[350px] scrollbar-thin scrollbar-thumb-slate-700"><code>{code}</code></pre>
  </div>
);

const SnippetView: React.FC<{ title: string, code: string }> = ({ title, code }) => (
  <div className="space-y-2">
    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{title}</p>
    <pre className="p-3 bg-black/40 rounded border border-slate-700 text-[10px] overflow-x-auto whitespace-pre-wrap max-h-[150px]">{code}</pre>
  </div>
);

const StatCard: React.FC<{ label: string, value: number | string, unit: string, color: string }> = ({ label, value, unit, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
    <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">{label}</p>
    <div className="flex items-baseline gap-1"><span className={`text-2xl font-bold ${color}`}>{value}</span><span className="text-slate-500 text-xs">{unit}</span></div>
  </div>
);

const ChartContainer: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
    <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">{title}</h3>
    {children}
  </div>
);

export default App;
