import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Compass, Mic, Save, 
  Download, ChevronDown, User, History, Send 
} from 'lucide-react';

const App = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30">
      {/* Background Decorative Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex h-screen overflow-hidden">
        
        {/* --- 1. SIDEBAR (Desktop) --- */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-white/2 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Compass className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Vagabond AI</span>
          </div>

          {/* User Profile Card */}
          <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Alex River</p>
                <p className="text-[10px] text-slate-400">Luxury • Backpacker</p>
              </div>
            </div>
          </div>

          {/* Saved Trips */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Saved Adventures</h3>
            <div className="space-y-2">
              {['Tokyo Spring 2024', 'Amalfi Coast', 'Iceland Ring Road'].map((trip) => (
                <button key={trip} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-slate-400 hover:text-white flex items-center gap-3">
                  <History size={14} /> {trip}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          
          {/* HERO SECTION */}
          <section className="max-w-4xl mx-auto pt-16 pb-10 px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                🧭 AI Travel Planner <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Assistant</span>
              </h1>
              <p className="text-slate-400 text-lg">Plan trips, discover hidden gems, and explore like a local.</p>
            </motion.div>

            {/* SEARCH CARD (The Core Input) */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Starting Location" icon={<MapPin size={18}/>} placeholder="San Francisco, CA" />
                <InputGroup label="Destination" icon={<Compass size={18}/>} placeholder="Kyoto, Japan" />
                <InputGroup label="Dates" icon={<Calendar size={18}/>} placeholder="Oct 12 - Oct 24" />
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 ml-1">Travel Style</label>
                  <select className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-teal-500/50 transition-all appearance-none">
                    <option>Leisure</option>
                    <option>Adventure</option>
                    <option>Luxury</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <label className="text-xs font-medium text-slate-400 ml-1">Additional Preferences</label>
                <textarea 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 h-24 outline-none focus:border-teal-500/50 transition-all"
                  placeholder="I love street food, photography, and hiking. Avoid tourist traps."
                />
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setIsGenerating(true)}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>✨ Generate Travel Plan</span>
                </button>
                <button className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-teal-400 group relative">
                  <Mic size={24} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                  </span>
                </button>
              </div>
            </div>

            {/* AI OUTPUT AREA */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 space-y-6 pb-20"
                >
                  <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="text-3xl">🧳</span> Your Travel Plan
                    </h2>
                    <div className="flex gap-2">
                      <ActionButton icon={<Save size={16}/>} label="Save" />
                      <ActionButton icon={<Download size={16}/>} label="PDF" />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-teal-400 font-bold mb-2 uppercase text-xs tracking-widest">Trip Summary</h3>
                    <p className="text-white text-lg leading-relaxed">
                      A 12-day cultural immersion in Kyoto focusing on Zen architecture, 
                      Gion’s hidden culinary scene, and the autumn foliage of Arashiyama.
                    </p>
                  </div>

                  {/* Itinerary Accordions (Example Card) */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((day) => (
                      <div key={day} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                        <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-teal-500 font-black text-xl">0{day}</span>
                            <span className="text-white font-medium">Ancient Temples & Market Flavors</span>
                          </div>
                          <ChevronDown size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
};

// Helper Components
const InputGroup = ({ label, icon, placeholder }) => (
  <div className="space-y-2">
    <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
      <input 
        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600 text-white" 
        placeholder={placeholder}
      />
    </div>
  </div>
);

const ActionButton = ({ icon, label }) => (
  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all text-slate-300">
    {icon} {label}
  </button>
);

export default App;