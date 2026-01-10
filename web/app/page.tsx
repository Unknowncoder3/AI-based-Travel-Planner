"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Compass,
  User,
  History,
} from "lucide-react";

export default function Home() {
  return <App />;
}

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [style, setStyle] = useState("Leisure");
  const [preferences, setPreferences] = useState("");

  const generatePlan = async () => {
    console.log("Generate clicked");
    setIsGenerating(true);

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          days: 3,
          style,
          preferences,
        }),
      });

      const data = await res.json();
      setPlan(data.sections);
    } catch (e) {
      console.error(e);
      alert("Backend not reachable. Is FastAPI running?");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex h-screen overflow-hidden">
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-white/2 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Compass className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Vagabond AI
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Alex River</p>
                <p className="text-[10px] text-slate-400">
                  Luxury • Backpacker
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">
              Saved Adventures
            </h3>
            <div className="space-y-2">
              {["Tokyo Spring 2024", "Amalfi Coast", "Iceland Ring Road"].map(
                (trip) => (
                  <button
                    key={trip}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-slate-400 hover:text-white flex items-center gap-3"
                  >
                    <History size={14} /> {trip}
                  </button>
                )
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <section className="max-w-4xl mx-auto pt-16 pb-10 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                🧭 AI Travel Planner{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  Assistant
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Plan trips, discover hidden gems, and explore like a local.
              </p>
            </motion.div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Starting Location" icon={<MapPin size={18} />} placeholder="San Francisco, CA" value={origin} onChange={setOrigin} />
                <InputGroup label="Destination" icon={<Compass size={18} />} placeholder="Kyoto, Japan" value={destination} onChange={setDestination} />
                <InputGroup label="Dates" icon={<Calendar size={18} />} placeholder="Oct 12 - Oct 24" value={dates} onChange={setDates} />
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 ml-1">Travel Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 outline-none">
                    <option>Leisure</option>
                    <option>Adventure</option>
                    <option>Luxury</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-xs font-medium text-slate-400 ml-1">Additional Preferences</label>
                <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 h-24 outline-none" />
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className={`flex-1 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-4 rounded-2xl transition-all
                    ${isGenerating ? "opacity-60 cursor-not-allowed" : "hover:from-teal-400 hover:to-blue-500"}
                  `}
                >
                  {isGenerating ? "⏳ Generating..." : "✨ Generate Travel Plan"}
                </button>
              </div>
            </div>

            {plan && (
              <motion.div className="mt-12 space-y-6 pb-20">
                <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-2xl p-6">
                  <h3 className="text-teal-400 text-xs uppercase tracking-widest mb-3">
                    Trip Overview
                  </h3>

                  {plan.Summary.split(". ").map((line: string, i: number) => (
                    <p key={i} className="text-white/90 leading-relaxed mb-2">
                      {line.trim()}
                    </p>
                  ))}
                </div>

                {plan.Itinerary
                  ?.split(/Day\s+\d+/)
                  .filter(Boolean)
                  .map((day: string, i: number) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
                    >
                      <span className="text-teal-500 font-black text-lg">
                        Day {i + 1}
                      </span>

                      {day
                        .split(" - ")
                        .filter(Boolean)
                        .map((p: string, j: number) => (
                          <p key={j} className="text-slate-200 leading-relaxed mt-2">
                            {p.trim()}
                          </p>
                        ))}
                    </div>
                  ))}
              </motion.div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none text-white" placeholder={placeholder} />
      </div>
    </div>
  );
}
