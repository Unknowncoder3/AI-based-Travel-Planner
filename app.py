# app.py (fixed: removed experimental_rerun calls)
import io
import base64
import datetime
import textwrap
import streamlit as st

# --- Try to import optional libraries; fallback if missing ---
try:
    import speech_recognition as sr
except Exception:
    sr = None

try:
    import pyttsx3
except Exception:
    pyttsx3 = None

try:
    from langchain_community.chat_message_histories import ChatMessageHistory
    from langchain_core.prompts import PromptTemplate
    from langchain_ollama import OllamaLLM
except Exception:
    # Minimal fallbacks so the UI still runs
    class ChatMessageHistory:
        def __init__(self):
            self.messages = []

        def add_user_message(self, text):
            self.messages.append(type("M", (), {"type": "user", "content": text}))

        def add_ai_message(self, text):
            self.messages.append(type("M", (), {"type": "ai", "content": text}))

    class PromptTemplate:
        def __init__(self, input_variables, template):
            self.input_variables = input_variables
            self.template = template

        def format(self, **kwargs):
            return self.template.format(**kwargs)

    class OllamaLLM:
        def __init__(self, model="mistral"):
            self.model = model

        def invoke(self, prompt_text):
            return ("[LLM fallback] Demo travel plan.\n\n"
                    "Summary:\n- Quick demo summary\n\nItinerary:\nDay 1: Explore downtown.\nDay 2: Beach time.\n\nFood & Culture:\n- Local specialties.\n\nPractical tips:\n- Pack light.")

# ---------------------------
# Load LLM (or fallback)
# ---------------------------
try:
    llm = OllamaLLM(model="mistral")
except Exception:
    llm = OllamaLLM()

# ---------------------------
# Chat history init
# ---------------------------
if "chat_history" not in st.session_state:
    st.session_state.chat_history = ChatMessageHistory()

# ---------------------------
# Text-to-Speech init
# ---------------------------
TTS_AVAILABLE = False
if pyttsx3 is not None:
    try:
        engine = pyttsx3.init()
        engine.setProperty("rate", 160)
        TTS_AVAILABLE = True
    except Exception:
        TTS_AVAILABLE = False

def speak(text):
    if not TTS_AVAILABLE:
        st.info("Text-to-speech not available in this environment.")
        return
    engine.say(text)
    engine.runAndWait()

# ---------------------------
# Speech recognition
# ---------------------------
SR_AVAILABLE = sr is not None
if SR_AVAILABLE:
    recognizer = sr.Recognizer()
else:
    recognizer = None

def listen():
    if not SR_AVAILABLE:
        st.info("Voice input not available. Type your query below instead.")
        return st.text_input("Type what you'd say (voice fallback)", key="voice_fallback")
    with st.spinner("🎤 Listening... speak now"):
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source)
                audio = recognizer.listen(source, timeout=6, phrase_time_limit=12)
            query = recognizer.recognize_google(audio)
            return query
        except sr.UnknownValueError:
            st.warning("Couldn't understand audio — try typing or speak more clearly.")
            return ""
        except Exception as e:
            st.error(f"Microphone error: {e}")
            return ""

# ---------------------------
# Prompt template
# ---------------------------
travel_prompt = PromptTemplate(
    input_variables=["chat_history", "question"],
    template="""
You are a **Travel Planning AI Assistant**.

You provide:
- Travel routes & directions
- Main attractions + hidden gems
- Local foods & culture info
- Best times to visit
- Detailed itineraries

Keep answers structured, friendly, and practical.

Conversation so far:
{chat_history}

User question:
{question}

AI Travel Assistant:
"""
)

def run_chain(question):
    chat_history_text = "\n".join(
        [f"{msg.type.capitalize()}: {msg.content}" for msg in st.session_state.chat_history.messages]
    )
    prompt_text = travel_prompt.format(chat_history=chat_history_text, question=question)
    try:
        response = llm.invoke(prompt_text)
    except Exception as e:
        response = f"[LLM error / fallback] Could not reach model: {e}\n\nPlease try again later."
    # save to history
    try:
        st.session_state.chat_history.add_user_message(question)
        st.session_state.chat_history.add_ai_message(response)
    except Exception:
        pass
    return response

# ---------------------------
# Utilities
# ---------------------------
def split_sections(text):
    sections = {}
    lines = text.strip().splitlines()
    current = "Summary"
    sections[current] = []
    for ln in lines:
        ln_stripped = ln.strip()
        if ln_stripped.lower().startswith("itinerary"):
            current = "Itinerary"
            sections[current] = []
            continue
        if ln_stripped.lower().startswith("food"):
            current = "Food & Culture"
            sections[current] = []
            continue
        if ln_stripped.lower().startswith("practical") or ln_stripped.lower().startswith("tips"):
            current = "Practical Tips"
            sections[current] = []
            continue
        if ln_stripped.lower().startswith("summary"):
            current = "Summary"
            sections[current] = []
            continue
        sections.setdefault(current, []).append(ln)
    for k in list(sections.keys()):
        sections[k] = "\n".join(sections[k]).strip()
    return sections

def make_text_download(data_str, filename="itinerary.txt"):
    return (filename, data_str.encode("utf-8"))

def make_pdf_download(text, filename="itinerary.pdf"):
    try:
        from fpdf import FPDF
    except Exception:
        return None
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    for line in textwrap.wrap(text, width=90):
        pdf.cell(0, 6, line, ln=True)
    bio = io.BytesIO()
    pdf.output(bio)
    bio.seek(0)
    return (filename, bio.read())

# ---------------------------
# Styling
# ---------------------------
st.set_page_config(page_title="AI Travel Planner", layout="wide", initial_sidebar_state="expanded")

CSS = """
body { background: linear-gradient(160deg, #0f172a 0%, #0b1220 40%, #061324 100%); }
.full-hero { padding: 40px; border-radius: 16px; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); backdrop-filter: blur(8px); box-shadow: 0 8px 30px rgba(2,6,23,0.6); }
.search-card { border-radius: 14px; padding: 18px; transition: transform .22s ease, box-shadow .22s ease; border: 1px solid rgba(255,255,255,0.04); }
.search-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(2,6,23,0.6); }
.btn-cta { background: linear-gradient(90deg,#FF8A65,#FFB86C); color: #06202b; font-weight: 700; border-radius: 999px; padding: 10px 18px; }
.mic-btn { width:48px;height:48px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center; box-shadow: 0 6px 18px rgba(0,0,0,0.4); transition: transform .12s ease; }
.mic-btn:hover { transform: scale(1.06); }
.chat-bubble { padding:12px 16px;border-radius:12px;margin:6px 0;max-width:75%; }
.chat-user { background: linear-gradient(90deg,#1e293b,#0f172a); color:#fff; margin-left:auto;}
.chat-ai { background: rgba(255,255,255,0.04); color:#fff; margin-right:auto;}
.small-muted { color: rgba(255,255,255,0.55); font-size:12px; }
.hero-title { font-size:34px; font-weight:700; color: #fff; margin-bottom:4px; }
.hero-sub { font-size:14px; color: rgba(255,255,255,0.8); margin-bottom:12px; }
.round-card { border-radius:16px; padding:12px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); }
.fade-in { animation: fadeIn .9s ease both; }
@keyframes fadeIn { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: none } }
"""

st.markdown(f"<style>{CSS}</style>", unsafe_allow_html=True)

# ---------------------------
# Sidebar profile
# ---------------------------
with st.sidebar:
    st.markdown("<div class='round-card fade-in'>", unsafe_allow_html=True)
    st.markdown("### 🙍‍♀️ Profile")
    if "user_profile" not in st.session_state:
        st.session_state.user_profile = {
            "name": "Guest Traveler",
            "email": "",
            "avatar": None,
            "style": "Leisure",
            "saved_trips": []
        }

    avatar_file = st.file_uploader("Upload avatar (optional)", type=["png", "jpg", "jpeg"], key="avatar_uploader")
    if avatar_file is not None:
        st.session_state.user_profile["avatar"] = avatar_file.getvalue()
    if st.session_state.user_profile["avatar"]:
        avatar_b64 = base64.b64encode(st.session_state.user_profile["avatar"]).decode()
        st.markdown(f"<img src='data:image/png;base64,{avatar_b64}' style='width:84px;height:84px;border-radius:50%;object-fit:cover;margin-bottom:10px'/>", unsafe_allow_html=True)
    else:
        st.markdown("<div style='width:84px;height:84px;border-radius:50%;background:linear-gradient(90deg,#667eea,#764ba2);display:inline-block;margin-bottom:10px'></div>", unsafe_allow_html=True)

    st.session_state.user_profile["name"] = st.text_input("Name", st.session_state.user_profile.get("name", "Guest Traveler"))
    st.session_state.user_profile["email"] = st.text_input("Email (optional)", st.session_state.user_profile.get("email", ""))
    st.session_state.user_profile["style"] = st.selectbox("Preferred travel style", ["Leisure", "Backpacking", "Luxury", "Family", "Adventure"], index=0)
    if st.button("Save profile"):
        st.success("Profile saved ✅")
    st.markdown("---")
    st.markdown("### 💾 Saved Trips")
    if not st.session_state.user_profile.get("saved_trips"):
        st.info("No saved trips yet — generate a plan and save it!")
    else:
        for i, trip in enumerate(st.session_state.user_profile["saved_trips"]):
            st.markdown(f"- **{trip.get('title','Trip')}** — {trip.get('date','-')}")
            if st.button(f"Load Trip {i}", key=f"loadtrip_{i}"):
                st.session_state.origin = trip.get("origin", "")
                st.session_state.destination = trip.get("destination", "")

    st.markdown("</div>", unsafe_allow_html=True)

# ---------------------------
# Main layout
# ---------------------------
col1, col2 = st.columns([2, 3], gap="large")

with col1:
    st.markdown("<div class='full-hero fade-in'>", unsafe_allow_html=True)
    st.markdown("<div style='display:flex;align-items:center;justify-content:space-between'>", unsafe_allow_html=True)
    st.markdown("<div>", unsafe_allow_html=True)
    st.markdown("<div class='hero-title'>🧭 AI Travel Planner Assistant</div>", unsafe_allow_html=True)
    st.markdown("<div class='hero-sub'>Plan trips, discover hidden gems and local culture — by text or voice.</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # simple decorative block (Lottie optional)
    try:
        from streamlit_lottie import st_lottie
        lottie_available = True
    except Exception:
        lottie_available = False

    if lottie_available:
        try:
            lottie_json = {"v":"5.5.7","fr":30,"ip":0,"op":60,"w":200,"h":200,"nm":"plane","ddd":0,"assets":[],"layers":[]}
            st_lottie(lottie_json, height=120, key="hero_lottie")
        except Exception:
            st.write("")
    else:
        st.markdown("<div style='width:120px;height:120px;border-radius:12px;background:linear-gradient(90deg,#00c6ff,#0072ff);display:inline-block'></div>", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<div class='search-card fade-in' style='margin-top:18px'>", unsafe_allow_html=True)

    origin = st.text_input("🏁 Starting Location", st.session_state.get("origin", ""), placeholder="E.g. Mumbai, India", key="origin_input")
    destination = st.text_input("📍 Destination", st.session_state.get("destination", ""), placeholder="E.g. Goa, India", key="destination_input")
    col_dates = st.columns(2)
    with col_dates[0]:
        start_date = st.date_input("Start date (optional)", value=st.session_state.get("start_date", datetime.date.today()))
    with col_dates[1]:
        end_date = st.date_input("End date (optional)", value=st.session_state.get("end_date", datetime.date.today() + datetime.timedelta(days=3)))
    travel_style = st.selectbox("Travel style", ["Leisure", "Backpacking", "Luxury", "Family", "Adventure"], index=0)
    num_days = st.slider("Trip length (days)", 1, 30, 3)
    extra_request = st.text_area("✏️ Trip preferences (food, pace, budget)", st.session_state.get("extra_request", ""), key="extra_req")
    st.markdown("<div style='display:flex;gap:12px;margin-top:6px'>", unsafe_allow_html=True)

    # Generate button - no forced rerun
    generate_col1, generate_col2 = st.columns([3,1])
    with generate_col1:
        if st.button("✨ Generate Travel Plan", key="generate_button", help="Generate a travel plan for this route"):
            if origin.strip() == "" or destination.strip() == "":
                st.warning("Please enter both starting location and destination.")
            else:
                query = f"Plan a {num_days}-day trip from {origin} to {destination}. Dates: {start_date} → {end_date}. Travel style: {travel_style}. Preferences: {extra_request}"
                with st.spinner("⏳ Generating your travel plan — one moment!"):
                    ai_response = run_chain(query)
                # store response in session state (no explicit rerun required)
                st.session_state.last_response = ai_response

    # Voice input
    with generate_col2:
        st.markdown("""
        <button class='mic-btn' title='Voice Input' id='mic-btn'>
            🎤
        </button>
        """, unsafe_allow_html=True)
        if st.button("🎤 Voice Input", key="voice_button"):
            spoken = listen()
            if spoken:
                with st.spinner("Processing voice input..."):
                    ai_response = run_chain(spoken)
                st.session_state.last_response = ai_response

    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # Quick suggestions
    st.markdown("<div style='margin-top:14px'>", unsafe_allow_html=True)
    st.markdown("#### Quick Suggestions")
    st.markdown("<div style='display:flex;gap:8px'>", unsafe_allow_html=True)
    if st.button("Surprise me ✨"):
        demo_query = "Generate a 3-day surprise trip weekend with beach + food for a budget traveler."
        with st.spinner("Generating surprise plan..."):
            st.session_state.last_response = run_chain(demo_query)
    if st.button("Popular: Paris → Nice"):
        demo_query = "Plan a 5-day trip from Paris to Nice with trains, attractions and food tips."
        with st.spinner("Generating..."):
            st.session_state.last_response = run_chain(demo_query)
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with col2:
    st.markdown("<div class='round-card fade-in'>", unsafe_allow_html=True)
    st.markdown("### 🧳 Travel Plan")
    if "last_response" not in st.session_state:
        st.markdown("No plan generated yet. Use the search on the left to create one.")
    else:
        raw = st.session_state.last_response
        sections = split_sections(raw)
        if sections.get("Summary"):
            st.markdown("**Summary**")
            st.markdown(f"<div class='round-card small-muted'>{sections['Summary']}</div>", unsafe_allow_html=True)
        if sections.get("Itinerary"):
            with st.expander("Itinerary (expand to view details)", expanded=True):
                st.markdown(sections["Itinerary"])
        if sections.get("Food & Culture"):
            st.markdown("**Food & Culture**")
            st.markdown(sections["Food & Culture"])
        if sections.get("Practical Tips"):
            st.markdown("**Practical Tips**")
            st.markdown(sections["Practical Tips"])
        btn_cols = st.columns([1,1,1,1])
        with btn_cols[0]:
            if st.button("🔊 Speak response", key="speak_response"):
                if "last_response" in st.session_state:
                    speak(st.session_state.last_response)
        with btn_cols[1]:
            if st.button("💾 Save to profile", key="save_trip"):
                trip_data = {
                    "title": f"{origin} → {destination}",
                    "date": str(datetime.date.today()),
                    "origin": origin,
                    "destination": destination,
                    "response": st.session_state.last_response
                }
                st.session_state.user_profile.setdefault("saved_trips", []).append(trip_data)
                st.success("Saved to your profile ✅")
        with btn_cols[2]:
            filename, data_bytes = make_text_download(raw, filename=f"itinerary_{origin}_{destination}.txt")
            st.download_button("📄 Download Text", data=data_bytes, file_name=filename, mime="text/plain")
        with btn_cols[3]:
            pdf = make_pdf_download(raw)
            if pdf:
                filename_pdf, pdf_bytes = pdf
                st.download_button("📕 Download PDF", data=pdf_bytes, file_name=filename_pdf, mime="application/pdf")
            else:
                st.info("PDF export requires the 'fpdf' library. Install `pip install fpdf` to enable PDF downloads.")
    st.markdown("</div>", unsafe_allow_html=True)

    # Chat history
    st.markdown("<div style='margin-top:14px' class='round-card fade-in'>", unsafe_allow_html=True)
    st.markdown("### 💬 Conversation History")
    st.markdown("<div style='max-height:360px;overflow:auto;padding-right:8px'>", unsafe_allow_html=True)
    for msg in st.session_state.chat_history.messages:
        if msg.type.lower() == "user":
            st.markdown(f"<div class='chat-bubble chat-user' style='text-align:right'>{msg.content}</div>", unsafe_allow_html=True)
        else:
            st.markdown(f"<div class='chat-bubble chat-ai'>{msg.content}</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    if st.button("Clear history"):
        st.session_state.chat_history = ChatMessageHistory()
        st.success("Chat history cleared.")
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown("<div style='padding:12px;margin-top:18px;color:rgba(255,255,255,0.6)'>", unsafe_allow_html=True)
st.markdown("Tip: Use the **Voice Input** button or type directly. Toggle profile settings in the sidebar. Customize visuals in the CSS section of the code.")
st.markdown("</div>", unsafe_allow_html=True)
