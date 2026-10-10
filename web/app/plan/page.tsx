"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Compass, MapPin, Mountain, Sparkles, Utensils, Wallet, Users, Leaf, Waves, Footprints, Route, Heart, Clock3, Coffee, Camera, TrainFront, BedDouble, Navigation, RotateCcw, Download, Sunrise, Sunset, CloudRain, ShieldCheck, ExternalLink } from "lucide-react";
import RouteMap, { type RoutePoint } from "./route-map";

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
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<RoutePoint[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [journeyRoute, setJourneyRoute] = useState<{origin?: RoutePoint; destination?: RoutePoint; intermediate_stops?: RoutePoint[]; route?: [number, number][]; distance_km?: number; duration_hours?: number; note?: string} | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [weatherAdvice, setWeatherAdvice] = useState<{forecast?: {date: string; temperature_min_c?: number; temperature_max_c?: number; precipitation_probability_percent?: number; precipitation_mm?: number}[]; safety_links?: {label: string; url: string}[]; note?: string} | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const dayPlaces = useMemo(() => discoveredPlaces.filter((_, index) => index % Math.max(1, Number(days)) === activeDay - 1).slice(0, 6), [discoveredPlaces, days, activeDay]);
  const destinationRoutePoints: RoutePoint[] = [
    ...(journeyRoute?.origin ? [{...journeyRoute.origin, category: "Start"}] : []),
    ...(journeyRoute?.destination ? [{...journeyRoute.destination, category: "Destination"}] : []),
  ];
  const imageForPlace = (place: RoutePoint) => place.image || (
    place.category?.includes("History") ? "https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=900&q=80" :
    place.category?.includes("Cafe") ? "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80" :
    place.category?.includes("Nature") ? "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80" :
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80"
  );

  async function loadTripContext() {
    setPlacesLoading(true); setJourneyLoading(true); setWeatherLoading(true);
    const query = (params: Record<string, string>) => new URLSearchParams(params).toString();
    const base = "http://127.0.0.1:8000";
    const jobs = [
      fetch(`${base}/discover?${query({destination})}`).then(async r => { if (!r.ok) throw new Error("places"); return r.json(); }).then(data => setDiscoveredPlaces(Array.isArray(data.places) ? data.places : [])).catch(() => setDiscoveredPlaces([])).finally(() => setPlacesLoading(false)),
      origin.trim() ? fetch(`${base}/journey?${query({origin, destination})}`).then(async r => { if (!r.ok) throw new Error("route"); return r.json(); }).then(data => setJourneyRoute(data)).catch(() => setJourneyRoute(null)).finally(() => setJourneyLoading(false)) : Promise.resolve().finally(() => { setJourneyRoute(null); setJourneyLoading(false); }),
      fetch(`${base}/conditions?${query({destination})}`).then(async r => { if (!r.ok) throw new Error("weather"); return r.json(); }).then(data => setWeatherAdvice(data)).catch(() => setWeatherAdvice(null)).finally(() => setWeatherLoading(false)),
    ];
    await Promise.all(jobs);
  }

  useEffect(() => { const value = new URLSearchParams(window.location.search).get("destination"); if (value) setDestination(value); }, []);

  const togglePreference = (name: string) => setPreferences(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  const itineraryText = String(result?.Itinerary ?? result?.itinerary ?? "");
  const dayPlans = itineraryText
    .split(/(?=^\s*Day\s+\d+\s*[:—-])/im)
    .map(part => part.trim())
    .filter(part => /^Day\s+\d+\s*[:—-]/i.test(part));
  const activeDayPlan = dayPlans.find(part => {
    const match = part.match(/^Day\s+(\d+)/i);
    return match ? Number(match[1]) === activeDay : false;
  }) ?? "";
  const activeDayTitle = activeDayPlan.split(/\r?\n/)[0]?.replace(/^Day\s+\d+\s*[:—-]\s*/i, "").trim();


  async function generatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true); setError(""); setResult(null); setIsFallback(false); setDiscoveredPlaces([]); setJourneyRoute(null); setWeatherAdvice(null);
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 115000);
      let response: Response;
      try {
        response = await fetch("http://127.0.0.1:8000/generate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ origin, destination, days: Number.parseInt(days, 10), style, preferences: preferences.join(", ") + (dates ? ` | Travel dates: ${dates}` : "") + ` | Budget: ${budget} | Travelers: ${travelers}` }),
        });
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          throw new Error("The planner took over 2 minutes to respond. Check that Ollama is running and the Mistral model is ready, then try again.");
        }
        throw new Error("Could not connect to the planner API at 127.0.0.1:8000. Keep the backend terminal open and check for errors.");
      } finally {
        window.clearTimeout(timeoutId);
      }
      if (!response.ok) throw new Error(`Planner API returned ${response.status}. Check that the FastAPI backend is running.`);
      const data = await response.json();
      setResult(data.sections ?? data);
      setIsFallback(Boolean(data.fallback));
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
        {result&&<div className="itinerary-workspace" id="itinerary-result"><div className={`itinerary-success${isFallback ? " itinerary-fallback" : ""}`}><span><Check size={15}/></span><div><strong>{isFallback ? "AI DIDN’T RESPOND — FALLBACK ITINERARY" : "YOUR AI ITINERARY IS READY"}</strong><small>{isFallback ? "This is a starter template, not a successful AI-generated plan. Check the planner status below and verify destination details." : "Review the outline, then fine-tune your preferences anytime."}</small></div><button type="button" onClick={()=>{setResult(null);window.scrollTo({top:0,behavior:"smooth"});}}><RotateCcw size={14}/> Edit trip</button></div><div className="itinerary-title-row"><div><span className="itinerary-eyebrow">YOUR NEXT CHAPTER</span><h2>{destination}, <em>day by day.</em></h2><p>{days} days · {travelers} · {budget}</p></div><button className="itinerary-export" type="button" onClick={()=>window.print()}><Download size={15}/> Save / Print</button></div><section className="route-preview"><div className="route-preview-top"><div><span className="route-kicker"><Route size={14}/> YOUR JOURNEY AT A GLANCE</span><h3>A route with room to wander.</h3></div><span className="route-badge">ROUTE CONCEPT</span></div><div className="route-illustration"><svg viewBox="0 0 680 170" role="img" aria-label="Illustrative route connecting your starting point, destination and exploration stops"><path d="M32 111 C90 110 92 49 164 64 S240 130 304 93 S396 32 455 70 S553 135 648 47" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="3" strokeDasharray="5 8"/><path d="M32 111 C90 110 92 49 164 64 S240 130 304 93 S396 32 455 70 S553 135 648 47" fill="none" stroke="#6f965c" strokeWidth="3" strokeDasharray="4 8" strokeLinecap="round"/>{[{x:32,y:111,n:"START",t:origin||"Your city"},{x:164,y:64,n:"STOP 01",t:"Explore"},{x:304,y:93,n:"STOP 02",t:"Discover"},{x:455,y:70,n:"STOP 03",t:"Unwind"},{x:648,y:47,n:"DESTINATION",t:destination}].map((p,i)=><g key={p.n}><circle cx={p.x} cy={p.y} r="12" fill={i===4?"#235b45":"#fffefa"} stroke={i===4?"#d9f078":"#6f965c"} strokeWidth="3"/><circle cx={p.x} cy={p.y} r="4" fill={i===4?"#d9f078":"#6f965c"}/><text x={p.x} y={p.y-23} textAnchor={p.x>600?"end":p.x<50?"start":"middle"} fill="currentColor" fontSize="9" fontWeight="800" letterSpacing="1">{p.n}</text><text x={p.x} y={p.y+30} textAnchor={p.x>600?"end":p.x<50?"start":"middle"} fill="currentColor" fontSize="11" fontWeight="600">{p.t.length>17?p.t.slice(0,16)+"…":p.t}</text></g>)}</svg><div className="route-note"><Navigation size={14}/> Illustrative route preview — exact distances, travel times and map directions need verification.</div></div></section><RouteMap points={destinationRoutePoints} route={journeyRoute?.route || []} title={origin.trim() ? `${origin} to ${destination}` : `Getting around ${destination}`} loading={journeyLoading} emptyMessage="Add a starting city to map the journey. Destination-specific stops are shown below." />{journeyRoute?.distance_km && <p className="route-distance-note">Approx. {journeyRoute.distance_km} km by road · {journeyRoute.duration_hours} hours before traffic or stops. {journeyRoute.note}</p>}<div className="itinerary-layout"><section className="day-planner"><div className="day-planner-heading"><div><span className="itinerary-eyebrow">YOUR DAILY FLOW</span><h3>The days, thoughtfully paced.</h3></div><span className="day-count">{days} DAYS</span></div><div className="day-tabs">{Array.from({length:Number(days)},(_,i)=>i+1).map(day=><button type="button" key={day} className={activeDay===day?"active":""} onClick={()=>setActiveDay(day)}><small>DAY</small>{String(day).padStart(2,"0")}</button>)}</div><div className="active-day-card"><div className="active-day-head"><div><span>DAY {String(activeDay).padStart(2,"0")} OF {days}</span><h4>{activeDayTitle || (activeDay===1?"Your first day":activeDay===Number(days)?"Your final day":"Explore & discover")}</h4></div><span className="day-sun"><Sunrise size={20}/></span></div>{activeDayPlan ? <><div className="generated-day-copy">{activeDayPlan.split(/\r?\n/).slice(1).filter(line=>line.trim()).map((line,index)=><p key={index}>{line.replace(/^[-•*\s]+/,"").trim()}</p>)}</div><div className="day-flex-note"><Sparkles size={15}/><span><strong>Travel thoughtfully.</strong> Treat this as a planning suggestion; confirm opening hours, local transport, activity safety, and availability before you go.</span></div></> : <div className="day-flex-note"><Sparkles size={15}/><span><strong>We couldn't identify a separate Day {activeDay} section.</strong> Check the full planner notes below for the assistant's complete response, or generate the itinerary again.</span></div>}</div></section><aside className="itinerary-side"><section className="trip-snapshot"><span className="itinerary-eyebrow">YOUR TRIP SNAPSHOT</span><div className="snapshot-row"><span><CalendarDays size={16}/> Duration</span><strong>{days} days / {Math.max(1,Number(days)-1)} nights</strong></div><div className="snapshot-row"><span><Users size={16}/> Travelers</span><strong>{travelers}</strong></div><div className="snapshot-row"><span><Wallet size={16}/> Budget range</span><strong>{budget}</strong></div><div className="snapshot-row"><span><Heart size={16}/> Travel mood</span><strong>{style}</strong></div><div className="snapshot-interests"><small>YOUR INTERESTS</small><div>{preferences.length?preferences.map(p=><span key={p}>{p}</span>):<span>Open to ideas</span>}</div></div></section><section className="smart-reminders"><span className="reminder-icon"><Footprints size={17}/></span><div><strong>Before you go</strong><p>Check local transport, seasonal closures, activity safety requirements and current prices before booking.</p></div></section><section className="seasonal-advice"><div className="seasonal-heading"><span className="reminder-icon"><ShieldCheck size={17}/></span><div><span className="itinerary-eyebrow">TRAVEL SMARTER</span><h3>Seasonal conditions & safety</h3></div></div>{weatherLoading ? <p className="seasonal-muted"><CloudRain size={15}/> Checking the latest available forecast…</p> : weatherAdvice?.forecast?.length ? <div className="forecast-strip">{weatherAdvice.forecast.slice(0,5).map(day=><article key={day.date}><small>{new Date(day.date + "T12:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</small><strong>{day.temperature_min_c ?? "—"}°–{day.temperature_max_c ?? "—"}°C</strong><span><CloudRain size={13}/> {day.precipitation_probability_percent ?? "—"}% rain</span><small>{day.precipitation_mm ?? "—"} mm expected</small></article>)}</div> : <p className="seasonal-muted">Live forecast unavailable. Check official weather and local advisories before departure.</p>}<div className="seasonal-checklist"><div><strong>Winter</strong><span>Layered warm clothing, windproof jacket, socks, gloves and any prescribed medicines. Hill mornings can feel much colder than the plains.</span></div><div><strong>Monsoon / heavy rain</strong><span>Waterproof layers, grippy footwear and a flexible plan. Avoid swollen rivers, waterfalls, landslide-prone roads and closed trails; do not travel into an active warning area.</span></div><div><strong>Mountain safety</strong><span>Forecasts do not confirm cloudburst or landslide safety. Recheck district warnings, road closures and local authority advice on the day; cancel remote outings if conditions deteriorate.</span></div></div><div className="official-safety-links">{(weatherAdvice?.safety_links || [{label:"India Meteorological Department (IMD)",url:"https://mausam.imd.gov.in/"},{label:"National Disaster Management Authority",url:"https://ndma.gov.in/"}]).map(link=><a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label} <ExternalLink size={12}/></a>)}</div><p className="seasonal-muted">{weatherAdvice?.note || "Forecasts are guidance, not emergency warnings. Follow official local instructions."} {weatherAdvice && "Weather data by Open-Meteo."}</p></section></aside></div><section className="generated-notes"><div><span className="itinerary-eyebrow">PLANNER NOTES</span><h3>What the travel assistant suggested</h3></div>{Object.entries(result).map(([key,value])=><article key={key} className="generated-note"><h4>{key.replaceAll("_"," ")}</h4><p>{typeof value==="string"?value:JSON.stringify(value,null,2)}</p></article>)}</section><div className="itinerary-next-step"><div><Sparkles size={20}/><div><strong>Your trip should feel like yours.</strong><span>Change your preferences or go back to the form to build another version.</span></div></div><button type="button" onClick={()=>{setResult(null);window.scrollTo({top:0,behavior:"smooth"});}}>Refine my trip <ArrowRight size={16}/></button></div></div>}
      </motion.section>
    </div>
    <footer className="plan-footer"><span>roamly<span className="plan-period">.</span> · Made for curious travelers</span><span>Travel thoughtfully. Leave room for wonder.</span><Link href="/#discover">Explore destinations <ArrowUpRight size={14}/></Link></footer>
  </main>;
}
