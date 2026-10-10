"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Compass, MapPin, Mountain, Sparkles, Utensils, Wallet, Users, Leaf, Waves, Footprints, Route, Heart, Clock3 } from "lucide-react";

const interestOptions = [
  { name: "Nature", icon: Leaf, note: "Forests, viewpoints and scenic trails" },
  { name: "Adventure", icon: Mountain, note: "Outdoor thrills and active days" },
  { name: "Food & culture", icon: Utensils, note: "Local flavours and living heritage" },
  { name: "Hidden gems", icon: Sparkles, note: "Less obvious stops and local secrets" },
  { name: "Beaches & water", icon: Waves, note: "Coastlines and water experiences" },
  { name: "Slow travel", icon: Heart, note: "Space to wander without rushing" },
];

export default function PlanPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("5");
  const [dates, setDates] = useState("");
  const [budget, setBudget] = useState("₹10,000–₹20,000");
  const [travelers, setTravelers] = useState("Two travelers");
  const [style, setStyle] = useState("A little bit of everything");
  const [preferences, setPreferences] = useState<string[]>(["Nature", "Hidden gems"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { const value = new URLSearchParams(window.location.search).get("destination"); if (value) setDestination(value); }, []);

  const togglePreference = (name: string) => setPreferences(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);

  async function generatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true); setError(""); setResult(null);
    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, days: Number.parseInt(days, 10), style, preferences: preferences.join(", ") + (dates ? ` | Travel dates: ${dates}` : "") + ` | Budget: ${budget} | Travelers: ${travelers}` }),
      });
      if (!response.ok) throw new Error(`Planner API returned ${response.status}. Check that the FastAPI backend is running.`);
      const data = await response.json();
      setResult(data.sections ?? data);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not reach the planner backend."); }
    finally { setIsGenerating(false); }
  }

  return <main className="plan-page">
    <nav className="plan-nav"><Link href="/" className="plan-brand"><span><Compass size={19}/></span> roamly<span className="plan-period">.</span></Link><Link href="/#discover" className="plan-back"><ArrowLeft size={15}/> Back to discover</Link><div className="plan-secure"><span/> YOUR NEXT STORY STARTS HERE</div></nav>
    <div className="plan-layout">
      <motion.aside className="plan-story" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }}>
        <div className="plan-kicker"><span/> YOUR JOURNEY, DESIGNED AROUND YOU</div>
        <h1>Less scrolling.<br/><em>More living.</em></h1>
        <p className="plan-lead">A thoughtful trip starts with what matters to you. Tell us your travel mood and we’ll shape a starter itinerary around your time, budget and curiosity.</p>
        <div className="plan-story-image"><img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85" alt="Mountain lake and scenic travel landscape"/><div className="plan-image-shade"/><div className="plan-image-caption"><span>YOUR NEXT CHAPTER</span><strong>Somewhere worth the journey.</strong></div><div className="plan-floating-note"><Sparkles size={15}/> Thoughtfully planned, never cookie-cutter</div></div>
        <div className="plan-promises"><div><span><Route size={17}/></span><div><strong>A route that makes sense</strong><small>Build days around geography, not guesswork.</small></div></div><div><span><Wallet size={17}/></span><div><strong>Budget in mind</strong><small>Keep your trip grounded in your budget.</small></div></div><div><span><Compass size={17}/></span><div><strong>Room for the unexpected</strong><small>Leave space for hidden gems and slow moments.</small></div></div></div>
      </motion.aside>
      <motion.section className="plan-form-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .08 }}>
        <div className="plan-form-top"><div><div className="plan-step">01 <span/> THE BASICS</div><h2>Let’s map out your trip.</h2><p>Start with a few details. You can fine-tune the journey next.</p></div><span className="plan-compass"><Compass size={24}/></span></div>
        <form onSubmit={generatePlan}>
          <div className="plan-fields">
            <label className="plan-field"><span><MapPin size={14}/> STARTING FROM</span><input value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="e.g. Kolkata" /></label>
            <label className="plan-field"><span><MapPin size={14}/> DESTINATION</span><input required value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Where do you want to go?" /></label>
            <label className="plan-field"><span><CalendarDays size={14}/> WHEN ARE YOU GOING?</span><input value={dates} onChange={e=>setDates(e.target.value)} placeholder="Flexible or e.g. 12–17 Nov" /></label>
            <label className="plan-field"><span><Clock3 size={14}/> HOW LONG?</span><select value={days} onChange={e=>setDays(e.target.value)}><option value="2">A quick escape · 2 days</option><option value="3">3 days</option><option value="5">5 days</option><option value="7">7 days</option><option value="10">10 days</option><option value="14">Two weeks</option></select></label>
            <label className="plan-field"><span><Wallet size={14}/> TOTAL TRIP BUDGET</span><select value={budget} onChange={e=>setBudget(e.target.value)}><option>Under ₹5,000</option><option>₹5,000–₹10,000</option><option>₹10,000–₹20,000</option><option>₹20,000–₹40,000</option><option>₹40,000+</option></select></label>
            <label className="plan-field"><span><Users size={14}/> WHO’S COMING?</span><select value={travelers} onChange={e=>setTravelers(e.target.value)}><option>Just me</option><option>Two travelers</option><option>Friends / group</option><option>Family</option></select></label>
          </div>
          <div className="plan-preferences"><div className="plan-label-row"><span>WHAT FEELS LIKE YOU?</span><small>Choose all that fit</small></div><div className="plan-interest-grid">{interestOptions.map(({name, icon: Icon, note})=><button type="button" key={name} className={`plan-interest ${preferences.includes(name)?"selected":""}`} onClick={()=>togglePreference(name)}><span className="plan-interest-icon"><Icon size={17}/></span><span className="plan-interest-copy"><strong>{name}</strong><small>{note}</small></span><span className="plan-check">{preferences.includes(name)&&<Check size={13}/>}</span></button>)}</div></div>
          <label className="plan-field plan-travel-style"><span>YOUR TRAVEL RHYTHM</span><select value={style} onChange={e=>setStyle(e.target.value)}><option>A little bit of everything</option><option>Nature & slow travel</option><option>Adventure-packed</option><option>Food & culture</option><option>Relaxed and restorative</option><option>See as much as possible</option></select></label>
          {error&&<div className="plan-error"><strong>We couldn’t build the itinerary just yet.</strong><span>{error}</span><small>Your details are still here. Start the backend and try again.</small></div>}
          <button className="plan-submit" type="submit" disabled={isGenerating}>{isGenerating?"Putting your trip together…":"Build my itinerary"} {isGenerating?<span className="plan-spinner"/>:<ArrowRight size={17}/>}</button>
          <p className="plan-footnote"><Sparkles size={13}/> A first draft, made for you. You stay in control of every stop.</p>
        </form>
        {result&&<div className="plan-result"><div className="plan-result-kicker"><Check size={15}/> YOUR STARTER ITINERARY IS READY</div><h3>A trip to remember in {destination}</h3>{Object.entries(result).map(([key,value])=><section key={key} className="plan-result-section"><h4>{key.replaceAll("_"," ")}</h4><p>{typeof value==="string"?value:JSON.stringify(value,null,2)}</p></section>)}<button className="plan-submit" type="button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>Adjust my trip <ArrowRight size={17}/></button></div>}
      </motion.section>
    </div>
    <footer className="plan-footer"><span>roamly<span className="plan-period">.</span> · Made for curious travelers</span><span>Travel thoughtfully. Leave room for wonder.</span><Link href="/#discover">Explore destinations <ArrowUpRight size={14}/></Link></footer>
  </main>;
}
