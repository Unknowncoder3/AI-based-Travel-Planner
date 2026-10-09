"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronRight,
  Compass, Heart, MapPin, Menu, MessageCircle, Mountain, Search, Send, Moon,
  Sparkles, Star, Sun, Waves, X, Clock3, Utensils, Camera, Footprints,
  Leaf, Navigation, CalendarDays, Wallet, Users, Route, CloudSun, CircleHelp
} from "lucide-react";

type Destination = {
  name: string;
  region: string;
  category: string[];
  mood: string;
  description: string;
  duration: string;
  budget: string;
  rating: string;
  image: string;
  accent: string;
  gallery: string[];
  bestTime: string;
  about: string;
  highlights: string[];
  experiences: string[];
  localFood: string[];
  tripTips: string[];
  idealFor: string;
};

const destinations: Destination[] = [
  { name: "Darjeeling", region: "West Bengal, India", category: ["mountains", "nature"], mood: "Mountain air", description: "Tea gardens, toy-train nostalgia and misty Himalayan mornings.", duration: "3–4 days", budget: "From ₹6,500", rating: "4.8", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=85", accent: "Misty mornings", bestTime: "March–May and October–December", about: "A Himalayan hill town known for tea gardens, colonial-era charm, the Darjeeling Himalayan Railway and clear-day views of Kanchenjunga. Plan for winding roads, cool evenings and a slower mountain pace.", highlights: ["Tiger Hill sunrise (weather permitting)", "Darjeeling Himalayan Railway / toy train", "Tea garden walks and estate visits", "Batasia Loop and Ghoom Monastery", "Observatory Hill and Chowrasta"], experiences: ["Sunrise viewpoint visit", "Tea tasting and garden tour", "Toy-train ride", "Short guided nature walks"], localFood: ["Momos with spicy chutney", "Thukpa noodle soup", "Traditional Nepali-style thali", "Darjeeling tea and local bakery snacks"], tripTips: ["Carry layers and a light rain jacket; weather changes quickly", "Start early for popular viewpoints and allow extra road time", "Check toy-train schedules and tea-estate visiting hours ahead", "Mountain views depend on season and cloud cover"], idealFor: "Mountain scenery, tea lovers, couples, slow travel and photography", gallery: [
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1500&q=90"
  ] },
  { name: "Andaman Islands", region: "Bay of Bengal, India", category: ["islands", "nature"], mood: "Ocean time", description: "Blue water, coral worlds and the kind of quiet you can hear.", duration: "5–7 days", budget: "From ₹18,000", rating: "4.9", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=85", accent: "Find your blue", bestTime: "October–May (sea and weather conditions vary)", about: "An island escape built around clear-water beaches, marine life, forested islands and a relaxed coastal rhythm. Port Blair / Sri Vijaya Puram is the main arrival hub; ferry schedules shape how much you can comfortably see.", highlights: ["Radhanagar Beach on Havelock / Swaraj Dweep", "Snorkelling and certified scuba-diving operators", "Cellular Jail and its light-and-sound presentation", "Neil / Shaheed Dweep beaches and natural rock formations", "Sea views around selected island jetties and coves"], experiences: ["Snorkelling or scuba with licensed operators", "Kayaking where permitted and conditions allow", "Beach sunsets and swimming only in designated safe areas", "Glass-bottom boat trips where available"], localFood: ["Fresh seafood at reputable local restaurants", "Coconut-based island curries", "Grilled fish and prawns", "South Indian breakfasts and local fruit"], tripTips: ["Book inter-island ferries early and keep buffer time for weather delays", "Never enter the sea where warning flags or lifeguards advise against it", "Use reef-safe practices and do not touch coral or marine wildlife", "Check permits, island access rules and activity availability before travel"], idealFor: "Beach holidays, marine-life enthusiasts, couples and water-sport beginners", gallery: [
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1500&q=90"
  ] },
  { name: "Jaipur", region: "Rajasthan, India", category: ["culture", "food"], mood: "Living history", description: "Pink-city lanes, old-world craft, courtyards and bold flavors.", duration: "2–3 days", budget: "From ₹5,000", rating: "4.7", image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=85", accent: "A city with stories", bestTime: "October–March", about: "Rajasthan’s Pink City blends royal architecture, lively bazaars, craft traditions and a famously rich food culture. It works well as a compact city break, with early starts helping you avoid heat and crowds at major monuments.", highlights: ["Amber Fort and its hilltop setting", "Hawa Mahal façade and surrounding old-city lanes", "City Palace and Jantar Mantar", "Nahargarh Fort viewpoints (check access and timing)", "Johari Bazaar and Bapu Bazaar for crafts"], experiences: ["Heritage walks with a knowledgeable local guide", "Block-printing or craft workshops", "Sunset views from an approved fort viewpoint", "Market browsing and local food tastings"], localFood: ["Pyaaz kachori", "Dal baati churma", "Ghewar and other seasonal sweets", "Laal maas at restaurants that serve it"], tripTips: ["Visit major forts early and check official opening hours", "Agree on transport fares or use a trusted app / prepaid option", "Buy crafts from reputable shops and ask about materials and returns", "Carry water and sun protection, especially from April to September"], idealFor: "Architecture, history, shopping, food trails and first-time Rajasthan trips", gallery: [
    "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1602643163983-ed0babc39797?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1500&q=90"
  ] },
  { name: "Meghalaya", region: "Northeast India", category: ["nature", "mountains"], mood: "Into the wild", description: "Living root bridges, forest trails and waterfalls tucked away.", duration: "4–6 days", budget: "From ₹8,000", rating: "4.8", image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1000&q=85", accent: "Follow the green", bestTime: "October–April for many hikes; monsoon brings dramatic rain but changes access", about: "Meghalaya is a green, rain-shaped landscape of living root bridges, caves, waterfalls and cloud-wrapped hills. Distances can take longer than they look on a map, so build a flexible itinerary and use local guides for hikes.", highlights: ["Living root bridges around the Cherrapunji / Sohra area", "Nohkalikai Falls viewpoints", "Mawlynnong village and nearby countryside", "Dawki river area when conditions are suitable", "Laitlum Canyon viewpoints near Shillong"], experiences: ["Guided root-bridge hikes", "Waterfall and viewpoint day trips", "Cave tours with authorised local guides", "River activities only with operators and weather clearance"], localFood: ["Jadoh rice and meat dish", "Dohneiiong, a sesame-based pork dish", "Tungrymbai fermented-soybean preparation", "Local seasonal produce and Khasi snacks"], tripTips: ["Monsoon rain can close trails and make river activities unsafe", "Use local guides and check trail conditions before setting out", "Wear shoes with grip and carry waterproof layers", "Keep extra travel time between Shillong, Sohra and Dawki"], idealFor: "Nature lovers, hikers, waterfalls, photography and offbeat road trips", gallery: [
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1500&q=90",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=90"
  ] },
];

const categoryOptions = [
  { id: "all", label: "All places", icon: Sparkles },
  { id: "mountains", label: "Mountains", icon: Mountain },
  { id: "islands", label: "Islands & beaches", icon: Waves },
  { id: "culture", label: "Culture & heritage", icon: Compass },
  { id: "nature", label: "Nature escapes", icon: Leaf },
  { id: "food", label: "Food trails", icon: Utensils },
];

const experiences = [
  { title: "Chase a little adrenaline.", subtitle: "Rafting, trails, diving and adventures that fit your destination.", label: "01 / GO OUTSIDE", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1100&q=85" },
  { title: "Follow your appetite.", subtitle: "Regional dishes, local markets and neighborhood favorites.", label: "02 / TASTE LOCAL", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85" },
  { title: "Stay for the moment.", subtitle: "Sunrise spots, quiet corners and scenic detours.", label: "03 / SLOW DOWN", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85" },
];

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [galleryPlace, setGalleryPlace] = useState<Destination | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("roamly-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("roamly-theme", theme);
  }, [theme]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [saved, setSaved] = useState<string[]>([]);
  const [searchDestination, setSearchDestination] = useState("");
  const [quickWhen, setQuickWhen] = useState("Anytime");
  const [quickStyle, setQuickStyle] = useState("Surprise me");
  const [quickBudget, setQuickBudget] = useState("Flexible");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [days, setDays] = useState("5");
  const [style, setStyle] = useState("Nature & slow travel");
  const [budget, setBudget] = useState("₹10,000–₹20,000");
  const [travelers, setTravelers] = useState("Two travelers");
  const [preferences, setPreferences] = useState<string[]>(["Nature", "Hidden gems"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [plannerError, setPlannerError] = useState("");
  const [toast, setToast] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Hey, explorer! 👋 I’m your little travel buddy. What kind of trip are you dreaming about — mountains, beaches, food trails, or a hidden gem?" },
  ]);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredDestinations = useMemo(() => destinations.filter((place) => activeCategory === "all" || place.category.includes(activeCategory)), [activeCategory]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const toggleSave = (name: string) => {
    const nextSaved = saved.includes(name) ? saved.filter((entry) => entry !== name) : [...saved, name];
    setSaved(nextSaved);
    showToast(nextSaved.includes(name) ? "Added to your saved places ♡" : "Removed from saved places");
  };

  const runQuickSearch = () => {
    if (searchDestination.trim()) {
      setDestination(searchDestination.trim());
      document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
    } else {
      document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const generatePlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    setPlannerError("");
    setPlan(null);
    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          days: Number.parseInt(days, 10) || 3,
          style,
          preferences: preferences.join(", ") + (dates ? ` | Travel dates: ${dates}` : "") + ` | Budget: ${budget} | Travelers: ${travelers}`,
        }),
      });
      if (!response.ok) throw new Error(`Planner API returned ${response.status}. Check that FastAPI is running.`);
      const data = await response.json();
      setPlan(data.sections ?? data);
      document.getElementById("itinerary-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Could not reach the planner backend.");
      showToast("Couldn’t reach the planner backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChat = (text?: string) => {
    const message = (text ?? chatText).trim();
    if (!message) return;
    setChatMessages((current) => [...current, { role: "user", text: message }]);
    setChatText("");
    window.setTimeout(() => {
      const lower = message.toLowerCase();
      let reply = "I can help shape your trip, find food and experiences, and make room for hidden gems. Tell me your destination, budget or travel mood to get started. This chat is currently a UI demo; live AI connection comes after the interface review.";
      if (lower.includes("hidden") || lower.includes("waterfall") || lower.includes("secret")) reply = "Hidden-gem mode activated 🌿 Tell me your destination and travel month. I’ll prioritize quieter viewpoints, local experiences and nature stops — with access and safety details checked before recommending them.";
      else if (lower.includes("budget") || lower.includes("cheap")) reply = "Let’s keep it budget-friendly. I’d compare transport first, then group nearby stops to reduce local travel. Which destination are you considering?";
      else if (lower.includes("beach") || lower.includes("island") || lower.includes("diving")) reply = "Ocean mood! 🌊 We can compare beaches, snorkeling, diving and boat experiences. The best options depend on season, sea conditions and verified local operators. Which island is on your mind?";
      else if (lower.includes("mountain") || lower.includes("trek") || lower.includes("rafting")) reply = "Mountain time 🏔️ We can explore scenic routes, treks, rafting and sunrise viewpoints. I’d check season, conditions and activity safety before locking anything in. Which region are you exploring?";
      setChatMessages((current) => [...current, { role: "bot", text: reply }]);
    }, 380);
  };

  return (
    <main className="roamly-app">
      <header className="site-header">
        <div className="container site-nav">
          <a href="#" className="brand" aria-label="Roamly home"><span className="brand-mark"><Compass size={20} /></span><span>roamly<span className="brand-period">.</span></span></a>
          <button className="mobile-menu-button" aria-label="Toggle navigation" onClick={() => setMobileMenu((open) => !open)}><Menu size={23} /></button>
          <nav className={`nav-links ${mobileMenu ? "nav-links-open" : ""}`}>
            <a href="#discover" onClick={() => setMobileMenu(false)}>Discover</a>
            <a href="#hidden-gems" onClick={() => setMobileMenu(false)}>Hidden gems</a>
            <a href="#experiences" onClick={() => setMobileMenu(false)}>Experiences</a>
            <a href="#planner" onClick={() => setMobileMenu(false)}>Trip planner</a>
          </nav>
          <div className="nav-actions"><button className="button button-quiet theme-toggle" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>{theme === "light" ? <Sun size={17} /> : <Moon size={17} />}</button><button className="button button-quiet" onClick={() => showToast(saved.length ? `You’ve saved ${saved.length} place(s).` : "Save a place with the heart icon to find it here.")}><Bookmark size={15} /> Saved{saved.length ? ` · ${saved.length}` : ""}</button><a className="button button-primary nav-cta" href="#planner">Plan a trip <ArrowUpRight size={16} /></a></div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
            <div className="eyebrow"><span /> TRAVEL, A LITTLE MORE YOU</div>
            <h1>Find your kind of <em>elsewhere.</em></h1>
            <p className="hero-description">Not just places to go. The little roads, local flavors, secret views and stories that make a trip yours.</p>
            <div className="hero-actions"><a className="button button-primary button-large" href="#planner">Build my journey <ArrowUpRight size={17} /></a><a className="button button-light button-large" href="#discover">Explore destinations</a></div>
            <div className="traveler-note"><div className="avatar-stack"><span>✦</span><span>☼</span><span>↗</span></div><p><strong>Made for curious travelers</strong><br />Slow down. Look closer. Go further.</p></div>
          </motion.div>
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7, delay: .1 }}>
            <img src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1500&q=90" alt="Sunlit wilderness and mountain scenery" />
            <div className="photo-tag"><Sparkles size={14} /> Your next favorite place</div>
            <div className="floating-note"><span className="note-icon"><Route size={17} /></span><div><strong>Go beyond the obvious</strong><span>Little-known stops, made discoverable.</span></div></div>
            <div className="hero-caption"><div className="caption-meta"><span>EDITOR’S PICK</span><span><MapPin size={13} /> Himalayan escapes</span></div><h2>Somewhere that stays with you.</h2><p>Find the view. Take the long way. Make a memory.</p></div>
          </motion.div>
        </div>
        <div className="container">
          <div className="quick-search">
            <label className="search-field search-destination"><span>WHERE TO?</span><div><Search size={17} /><input value={searchDestination} onChange={(event) => setSearchDestination(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runQuickSearch()} placeholder="A place, a feeling, anywhere…" /></div></label>
            <label className="search-field"><span>WHEN</span><select value={quickWhen} onChange={(event) => setQuickWhen(event.target.value)}><option>Anytime</option><option>Next weekend</option><option>In the next month</option><option>Winter escape</option></select></label>
            <label className="search-field"><span>TRAVEL STYLE</span><select value={quickStyle} onChange={(event) => setQuickStyle(event.target.value)}><option>Surprise me</option><option>Nature & slow travel</option><option>Adventure</option><option>Food & culture</option><option>Beach & water</option></select></label>
            <label className="search-field"><span>BUDGET</span><select value={quickBudget} onChange={(event) => setQuickBudget(event.target.value)}><option>Flexible</option><option>Under ₹5,000</option><option>₹5,000–₹15,000</option><option>₹15,000+</option></select></label>
            <button className="button button-primary search-submit" onClick={runQuickSearch}>Explore <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="section discover-section" id="discover">
        <div className="container">
          <div className="section-heading"><div><div className="eyebrow"><span /> A GOOD PLACE TO START</div><h2>Where do you want to feel?</h2><p>Choose a mood. We’ll help you find the place.</p></div><a href="#planner" className="text-link">Make it personal <ArrowUpRight size={15} /></a></div>
          <div className="category-list">{categoryOptions.map(({ id, label, icon: Icon }) => <button key={id} className={`category-chip ${activeCategory === id ? "selected" : ""}`} onClick={() => setActiveCategory(id)}><Icon size={15} /> {label}</button>)}</div>
          <div className="destination-grid">
            {filteredDestinations.map((place, index) => <motion.article className="destination-card" key={place.name} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: index * .04 }}>
              <button type="button" className="destination-image destination-image-button" onClick={() => { setGalleryPlace(place); setGalleryIndex(0); }} aria-label={`View ${place.name} photo gallery`}><img src={place.image} alt={`${place.name} travel scenery`} loading="lazy" /><span className="image-mood">{place.mood}</span><span className="gallery-hint"><Camera size={13} /> Explore photos</span></button><button className={`heart-button ${saved.includes(place.name) ? "is-saved" : ""}`} aria-label={saved.includes(place.name) ? `Remove ${place.name} from saved` : `Save ${place.name}`} onClick={() => toggleSave(place.name)}><Heart size={17} fill={saved.includes(place.name) ? "currentColor" : "none"} /></button>
              <div className="destination-content"><div className="card-meta"><span>{place.region}</span><span className="rating"><Star size={13} fill="currentColor" /> {place.rating}</span></div><h3>{place.name}</h3><p>{place.description}</p><div className="destination-footer"><span><CalendarDays size={14} /> {place.duration}</span><strong>{place.budget}</strong></div><button className="card-explore" onClick={() => { setDestination(place.name); document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" }); }}>Explore this place <ChevronRight size={15} /></button></div>
            </motion.article>)}
          </div>
          <p className="data-note"><CircleHelp size={14} /> Ratings and budget figures are concept content for this UI prototype, not live verified quotes.</p>
        </div>
      </section>

      <section className="section hidden-gems-section" id="hidden-gems">
        <div className="container"><div className="gems-panel"><div className="gems-copy"><div className="eyebrow"><span /> THE BEST BITS ARE OFTEN TUCKED AWAY</div><h2>Take the road<br />less <em>travelled.</em></h2><p>Find the quiet waterfall, the sunset no one told you about, the tiny local kitchen that becomes your favorite memory. Discoveries with a little more soul.</p><button className="button button-primary" onClick={() => { setPreferences((current) => current.includes("Hidden gems") ? current : [...current, "Hidden gems"]); document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" }); }}>Find my hidden gems <ArrowUpRight size={16} /></button><div className="gems-promise"><span><Compass size={19} /></span><div><strong>Curated for your kind of trip</strong><small>Interests, season and pace matter.</small></div></div></div><div className="gems-collage"><img className="gem-one" src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=85" alt="Waterfall in a green forest" loading="lazy" /><img className="gem-two" src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85" alt="Golden sunset over hills" loading="lazy" /><img className="gem-three" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85" alt="Traveler taking in a landscape" loading="lazy" /><img className="gem-four" src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85" alt="Mountain peaks" loading="lazy" /></div></div></div>
      </section>

      <section className="section experiences-section" id="experiences"><div className="container"><div className="section-heading"><div><div className="eyebrow"><span /> MAKE THE JOURNEY YOURS</div><h2>More than a pin on a map.</h2><p>Find experiences that turn a trip into a story.</p></div><a href="#planner" className="text-link">Build your itinerary <ArrowUpRight size={15} /></a></div><div className="experience-grid">{experiences.map((item) => <article className="experience-card" key={item.title}><img src={item.image} alt="" loading="lazy" /><div className="experience-shade" /><div className="experience-copy"><span>{item.label}</span><h3>{item.title}</h3><p>{item.subtitle}</p></div></article>)}</div></div></section>

      <section className="planner-section" id="planner"><div className="container planner-grid"><div className="planner-intro"><div className="eyebrow"><span /> YOUR TRIP, YOUR RULES</div><h2>Let’s make a plan<br />worth getting lost for.</h2><p>Tell us a little about your trip. Shape a starter itinerary around your time, budget and travel style.</p><div className="planner-benefits"><span><Navigation size={17} /> Visual routes</span><span><Sparkles size={17} /> Personal ideas</span><span><Wallet size={17} /> Budget-aware</span></div></div><div className="planner-card"><div className="planner-card-heading"><div><h3>Start your journey</h3><p>A few details. A world of possibilities.</p></div><span className="planner-icon"><Compass size={21} /></span></div><form onSubmit={generatePlan}><div className="form-grid"><label className="form-field"><span>Where are you starting?</span><input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="e.g. Kolkata" /></label><label className="form-field"><span>Where are you dreaming of?</span><input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Meghalaya, Andaman" /></label><label className="form-field"><span>Travel dates (optional)</span><input value={dates} onChange={(event) => setDates(event.target.value)} placeholder="e.g. 12–17 November" /></label><label className="form-field"><span>How long is the trip?</span><select value={days} onChange={(event) => setDays(event.target.value)}><option value="2">Weekend · 2 days</option><option value="3">3 days</option><option value="5">5 days</option><option value="7">7 days</option><option value="10">10+ days</option></select></label><label className="form-field"><span>Total budget (per trip)</span><select value={budget} onChange={(event) => setBudget(event.target.value)}><option>₹5,000–₹10,000</option><option>₹10,000–₹20,000</option><option>₹20,000–₹40,000</option><option>₹40,000+</option></select></label><label className="form-field"><span>Who’s coming?</span><select value={travelers} onChange={(event) => setTravelers(event.target.value)}><option>Just me</option><option>Two travelers</option><option>Friends / group</option><option>Family</option></select></label></div><div className="form-field preferences-field"><span>What sounds like you?</span><div className="preference-list">{["Nature", "Adventure", "Food & culture", "Hidden gems", "Slow travel"].map((preference) => <button type="button" key={preference} className={`preference-chip ${preferences.includes(preference) ? "selected" : ""}`} onClick={() => setPreferences((current) => current.includes(preference) ? current.filter((value) => value !== preference) : [...current, preference])}>{preferences.includes(preference) && <Check size={12} />}{preference}</button>)}</div></div><label className="form-field style-field"><span>Travel style</span><select value={style} onChange={(event) => setStyle(event.target.value)}><option>Nature & slow travel</option><option>Adventure</option><option>Food & culture</option><option>Relaxation</option><option>Mixed experience</option></select></label><button className="button button-primary planner-submit" type="submit" disabled={isGenerating}>{isGenerating ? "Building your itinerary…" : "Create my starter itinerary"} {isGenerating ? <Sparkles size={16} className="spin-icon" /> : <ArrowUpRight size={16} />}</button>{plannerError && <p className="form-error">{plannerError} This form still needs the local backend running at localhost:8000.</p>}</form></div></div>
      {plan && <div className="container itinerary-result" id="itinerary-result"><div className="result-heading"><div className="eyebrow"><span /> YOUR JOURNEY</div><h2>Your plan for {destination}</h2><p>Generated by the existing travel planner backend.</p></div><div className="result-summary"><h3>Trip overview</h3><p>{typeof plan.Summary === "string" ? plan.Summary : "Your itinerary is ready."}</p>{typeof plan.Itinerary === "string" && plan.Itinerary.split(/Day\s+\d+/).filter(Boolean).map((day: string, index: number) => <div className="result-day" key={index}><strong>Day {index + 1}</strong><p>{day.trim()}</p></div>)}</div></div>}
      </section>

      <footer className="site-footer"><div className="container footer-inner"><a href="#" className="brand"><span className="brand-mark"><Compass size={17} /></span><span>roamly<span className="brand-period">.</span></span></a><span>Made for curious travelers. Phase 1 is taking shape.</span><div><a href="#discover">Discover</a><a href="#planner">Plan a trip</a><a href="https://github.com/Unknowncoder3/AI-based-Travel-Planner" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} /></a></div></div></footer>

      {!chatOpen && <motion.button className="chat-launcher" onClick={() => setChatOpen(true)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} aria-label="Open Roamly travel buddy"><span className="chat-prompt">Need a little travel inspiration?</span><span className="doodle-face"><span className="doodle-sparkle">✦</span><span className="doodle-eyes"><i /><i /></span><span className="doodle-smile" /><span className="doodle-status" /></span></motion.button>}
      <AnimatePresence>{chatOpen && <motion.aside className="chat-widget" initial={{ opacity: 0, y: 15, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} transition={{ duration: .2 }} aria-label="Roamly travel assistant"><div className="chat-header"><span className="chat-avatar"><Compass size={19} /></span><div><strong>Roamly buddy</strong><small><span /> Here to help you explore</small></div><button aria-label="Close chat" className="chat-close" onClick={() => setChatOpen(false)}><X size={17} /></button></div><div className="chat-messages">{chatMessages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}>{message.text}</div>)}</div><div className="chat-suggestions"><button onClick={() => sendChat("Suggest a 3-day trip")}>3-day trip</button><button onClick={() => sendChat("Find hidden gems")}>Hidden gems</button><button onClick={() => sendChat("Help me plan on a budget")}>Budget ideas</button></div><form className="chat-input-row" onSubmit={(event) => { event.preventDefault(); sendChat(); }}><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Ask me about your trip…" aria-label="Message Roamly buddy" /><button type="submit" aria-label="Send message"><Send size={16} /></button></form><div className="chat-disclaimer">Demo assistant · live AI will be connected in a later phase</div></motion.aside>}</AnimatePresence>
      {chatOpen && <button className="chat-reopen-doodle" aria-label="Close chat" onClick={() => setChatOpen(false)}><span className="doodle-face small"><span className="doodle-eyes"><i /><i /></span><span className="doodle-smile" /></span></button>}
      <AnimatePresence>
        {galleryPlace && <motion.div className="gallery-backdrop" role="dialog" aria-modal="true" aria-label={`${galleryPlace.name} destination guide`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGalleryPlace(null)}>
          <motion.section className="gallery-modal destination-guide-modal" initial={{ opacity: 0, y: 22, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .99 }} transition={{ duration: .28 }} onClick={(event) => event.stopPropagation()}>
            <button className="gallery-close" onClick={() => setGalleryPlace(null)} aria-label="Close destination guide"><X size={20} /></button>
            <div className="gallery-photo"><img src={galleryPlace.gallery[galleryIndex]} alt={`${galleryPlace.name} scenery ${galleryIndex + 1}`} /><button className="gallery-arrow gallery-prev" aria-label="Previous photo" onClick={() => setGalleryIndex((galleryIndex - 1 + galleryPlace.gallery.length) % galleryPlace.gallery.length)}><ArrowDownRight size={19} className="gallery-prev-icon" /></button><button className="gallery-arrow gallery-next" aria-label="Next photo" onClick={() => setGalleryIndex((galleryIndex + 1) % galleryPlace.gallery.length)}><ArrowRight size={19} /></button><div className="gallery-photo-count">{String(galleryIndex + 1).padStart(2, "0")} / {String(galleryPlace.gallery.length).padStart(2, "0")} · EXPLORE {galleryPlace.name.toUpperCase()}</div></div>
            <div className="gallery-thumbnails">{galleryPlace.gallery.map((photo, index) => <button key={photo} className={index === galleryIndex ? "active" : ""} aria-label={`View photo ${index + 1}`} onClick={() => setGalleryIndex(index)}><img src={photo} alt="" loading="lazy" /></button>)}</div>
            <div className="guide-heading"><div><div className="eyebrow"><span /> YOUR DESTINATION GUIDE</div><h2>{galleryPlace.name}</h2><p className="guide-region"><MapPin size={15} /> {galleryPlace.region}</p><p className="guide-about">{galleryPlace.about}</p></div><div className="guide-budget"><span>IDEAL STAY</span><strong>{galleryPlace.duration}</strong><span>ESTIMATED STARTING BUDGET</span><strong>{galleryPlace.budget.replace("From ", "")}</strong><small>Per person estimate; verify before booking</small><button className="button button-primary" onClick={() => { setDestination(galleryPlace.name); setGalleryPlace(null); document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" }); }}>Plan this trip <ArrowUpRight size={16} /></button></div></div>
            <div className="guide-facts"><div><CalendarDays size={18} /><span>BEST TIME TO VISIT</span><strong>{galleryPlace.bestTime}</strong></div><div><Compass size={18} /><span>BEST FOR</span><strong>{galleryPlace.idealFor}</strong></div><div><Route size={18} /><span>TRIP PACE</span><strong>{galleryPlace.duration} recommended</strong></div></div>
            <div className="guide-content-grid">
              <section className="guide-section"><div className="guide-section-title"><MapPin size={18} /><h3>Places worth your time</h3></div><ul>{galleryPlace.highlights.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section className="guide-section"><div className="guide-section-title"><Sparkles size={18} /><h3>Experiences to look for</h3></div><ul>{galleryPlace.experiences.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section className="guide-section"><div className="guide-section-title"><Utensils size={18} /><h3>Local food to try</h3></div><ul>{galleryPlace.localFood.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section className="guide-section"><div className="guide-section-title"><CircleHelp size={18} /><h3>Smart travel tips</h3></div><ul>{galleryPlace.tripTips.map((item) => <li key={item}>{item}</li>)}</ul></section>
            </div>
            <div className="guide-bottom-cta"><div><strong>Like the sound of {galleryPlace.name}?</strong><span>Turn these ideas into a trip shaped around your time, budget and interests.</span></div><button className="button button-primary" onClick={() => { setDestination(galleryPlace.name); setGalleryPlace(null); document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" }); }}>Build my itinerary <ArrowUpRight size={16} /></button></div>
            <p className="guide-disclaimer">Travel guide content is a planning starting point. Check current opening hours, local conditions, permits, activity operators and prices before travelling.</p>
          </motion.section>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>{toast}</motion.div>}</AnimatePresence>
    </main>
  );
}
