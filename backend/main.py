# backend/main.py
import threading
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import PromptTemplate
from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="mistral")
chat_history = ChatMessageHistory()
history_lock = threading.Lock()

travel_prompt = PromptTemplate(
    input_variables=["chat_history", "question"],
    template="""You are Roamly, a practical travel-planning assistant.
Return these exact sections: SUMMARY:, ITINERARY:, FOOD & CULTURE:, PRACTICAL TIPS:.
Under ITINERARY, include Day 1 through the requested number of days. Each day must have a distinct title and Morning, Afternoon, Evening, and Getting around entries. Group nearby places together, use the traveler's interests and budget, and do not claim live prices, opening hours, bookings, or availability are verified.
Conversation so far:
{chat_history}
User question:
{question}
Roamly:
"""
)

def run_chain(question):
    with history_lock:
        history_text = "\n".join(f"{msg.type.capitalize()}: {msg.content}" for msg in chat_history.messages[-8:])
    prompt_text = travel_prompt.format(chat_history=history_text, question=question)
    response = llm.invoke(prompt_text)
    with history_lock:
        chat_history.add_user_message(question)
        chat_history.add_ai_message(response)
    return response

def split_sections(text):
    sections = {"Summary": []}
    current = "Summary"
    for line in text.strip().splitlines():
        lower = line.strip().lower().rstrip(":")
        if lower.startswith("itinerary"):
            current = "Itinerary"; sections[current] = []; continue
        if lower.startswith("food"):
            current = "Food & Culture"; sections[current] = []; continue
        if lower.startswith("practical") or lower.startswith("tips"):
            current = "Practical Tips"; sections[current] = []; continue
        if lower.startswith("summary"):
            current = "Summary"; sections[current] = []; continue
        sections.setdefault(current, []).append(line)
    return {key: "\n".join(value).strip() for key, value in sections.items()}

def fallback_itinerary(req):
    # A predictable starter draft keeps the planner usable if local AI is unavailable.
    destination = req.destination.strip()
    origin = req.origin.strip() or "your starting point"
    interests = req.preferences
    day_templates = [
        ("Arrive and get oriented", "Arrive, check in, and get familiar with the area around your stay.", "Visit a well-known central attraction or visitor area; check current opening times before leaving.", "Try a regional dish at a busy, well-reviewed local restaurant.", "Use a reputable taxi, transit service, or local operator; confirm fares first."),
        ("Explore the highlights", "Start early at one of the destination's best-known sights.", "Group two nearby attractions or a guided experience to avoid unnecessary travel.", "Visit a local market or a scenic public area before dinner.", "Check route conditions and allow buffer time between stops."),
        ("Nature and local experiences", "Choose a viewpoint, garden, waterfront, or easy nature walk suited to the destination.", "Explore a cultural site, craft area, or activity aligned with your interests.", "Leave time for a relaxed meal and an unhurried neighborhood walk.", "Ask local tourism staff about current access and weather conditions."),
        ("Hidden corners", "Ask a trusted local guide about a less-crowded place that is open to visitors.", "Choose a short walk, small museum, craft workshop, or local experience.", "Enjoy a sunset from a public, accessible viewpoint if weather permits.", "Do not enter restricted areas or attempt activities without qualified operators."),
        ("A slower final day", "Have breakfast and revisit a favorite nearby spot.", "Pick one remaining attraction close to your accommodation.", "Leave enough time to collect bags and prepare for departure.", "Confirm check-out, onward transport, and any ticket requirements.")
    ]
    days = max(1, min(int(req.days), 14))
    itinerary = []
    for i in range(days):
        title, morning, afternoon, evening, getting = day_templates[min(i, len(day_templates)-1)]
        if i >= len(day_templates):
            title = f"Explore at your own pace — day {i+1}"
            morning = f"Choose a highly rated attraction in {destination} and confirm today's access."
            afternoon = f"Explore a nearby area matching these interests: {interests}."
            evening = "Keep the evening flexible for local food or a relaxed walk."
            getting = "Check current local transport, weather, and journey times before setting out."
        itinerary.extend([f"Day {i+1}: {title}", f"Morning: {morning}", f"Afternoon: {afternoon}", f"Evening: {evening}", f"Getting around: {getting}", ""])
    raw = (
        f"SUMMARY:\nA {days}-day starter plan for {destination}, travelling from {origin}. "
        "This is a fallback draft because the local AI service did not respond in time. "
        "Check destination-specific details before booking.\n\n"
        "ITINERARY:\n" + "\n".join(itinerary) +
        "\nFOOD & CULTURE:\nExplore regional specialties and busy local eateries; ask about ingredients and dietary needs. "
        "Venue names, opening hours, and prices have not been live-verified.\n\n"
        "PRACTICAL TIPS:\nCheck weather, attraction hours, transport schedules, and activity safety before setting out. "
        "For adventure activities, use qualified operators and follow local advisories."
    )
    sections = split_sections(raw)
    sections["Status"] = "Fallback itinerary — local AI did not respond in time. Start Ollama to enable AI-personalized suggestions."
    return {"raw": raw, "sections": sections, "fallback": True}

app = FastAPI(title="Roamly Travel Planner API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TravelRequest(BaseModel):
    origin: str = ""
    destination: str
    days: int = 3
    style: str = "A little bit of everything"
    preferences: str = ""

@app.get("/health")
def health():
    return {"status": "ok", "service": "roamly-planner"}

@app.post("/generate")
def generate(req: TravelRequest):
    query = (
        f"Plan a {req.days}-day trip from {req.origin or 'the traveler\'s starting point'} to {req.destination}. "
        f"Travel style: {req.style}. Interests, dates and budget: {req.preferences}. "
        f"Generate exactly {req.days} distinct days."
    )
    completed = threading.Event()
    result = {}
    def work():
        try:
            result["text"] = run_chain(query)
        except Exception as exc:
            result["error"] = str(exc)
        finally:
            completed.set()
    threading.Thread(target=work, daemon=True).start()
    if not completed.wait(timeout=45):
        return fallback_itinerary(req)
    if "error" in result:
        fallback = fallback_itinerary(req)
        fallback["sections"]["Status"] = "Fallback itinerary — local AI error: " + result["error"][:240]
        return fallback
    raw = result["text"]
    return {"raw": raw, "sections": split_sections(raw), "fallback": False}
