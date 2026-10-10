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
    """Return a clearly-labelled, destination-aware starter plan when local AI is unavailable."""
    destination = req.destination.strip()
    origin = req.origin.strip() or "your starting point"
    interests = req.preferences
    days = max(1, min(int(req.days), 14))

    curated = {
        "darjeeling": [
            ("Arrive in the hills", "Check in and explore Chowrasta / Mall Road at an easy pace.", "Visit Observatory Hill if time and weather allow.", "Try momos or thukpa at a well-reviewed local eatery.", "Use local taxis for hill roads and confirm fares before setting off."),
            ("Sunrise and tea country", "Visit Tiger Hill very early for sunrise; mountain views depend on weather and access.", "Explore a tea estate that is open to visitors, and confirm tour times in advance.", "Walk around Batasia Loop and Ghoom area if transport and opening times work.", "Allow extra time for narrow, winding roads and traffic."),
            ("Toy train and town stories", "Check the current Darjeeling Himalayan Railway schedule and take a ride if available.", "Visit the Himalayan Mountaineering Institute or Padmaja Naidu Himalayan Zoological Park; check current hours.", "Browse local shops and enjoy tea with bakery snacks.", "Buy tickets through official channels where available; verify schedules."),
            ("A slower nature day", "Choose a short, accessible tea-garden or nature walk with local guidance.", "Visit a monastery or nearby viewpoint based on weather and transport.", "Leave time for a relaxed café stop and local food.", "Avoid isolated trails in poor weather and follow local advice."),
            ("One last mountain morning", "Have breakfast and revisit a favourite nearby spot.", "Keep the final outing close to your accommodation and pack with enough time.", "Prepare for onward travel.", "Confirm checkout, road conditions and onward transport.")
        ],
        "jaipur": [
            ("Arrive in the Pink City", "Check in and take an easy walk around the old city.", "See the Hawa Mahal exterior and nearby historic streets.", "Try a local Rajasthani meal at a well-reviewed restaurant.", "Use trusted transport and agree on fares before the ride."),
            ("Forts and royal history", "Start early at Amber Fort; confirm opening hours and access.", "Visit Jal Mahal viewpoint and group nearby stops to reduce travel.", "Explore a local market if time permits.", "Carry water and sun protection; travel times vary with traffic."),
            ("The historic centre", "Visit City Palace and Jantar Mantar; check current ticketing and hours.", "Explore the Hawa Mahal area and old-city lanes.", "Try pyaaz kachori or another local speciality.", "Check monument rules and use official ticket counters or sites."),
            ("Crafts and viewpoints", "Browse Johari Bazaar or Bapu Bazaar for crafts.", "Consider a block-printing or craft experience with a reputable operator.", "Visit a public viewpoint such as Nahargarh only after confirming access and timing.", "Agree prices before buying and use trusted transport."),
            ("A relaxed final day", "Have breakfast and revisit a favourite nearby attraction.", "Choose one remaining stop close to your accommodation.", "Leave time for checkout and departure.", "Confirm onward transport and traffic conditions.")
        ],
        "meghalaya": [
            ("Arrive and settle in", "Arrive via your booked hub and settle in Shillong or your planned base.", "Explore a nearby public area at an easy pace.", "Try a local Khasi meal at a well-reviewed restaurant.", "Allow generous road-transfer time; distances can take longer than expected."),
            ("Shillong and its viewpoints", "Visit a viewpoint such as Laitlum Canyon only after checking weather and access.", "Explore Shillong's local markets or cultural stops.", "Enjoy local food and an unhurried evening.", "Check conditions with local tourism staff before heading out."),
            ("Waterfalls and Sohra", "Travel towards Sohra / Cherrapunji with a reliable local driver.", "Visit accessible waterfall viewpoints such as Nohkalikai if open and safe.", "Return before dark where possible.", "Rain can affect visibility, roads and trail access."),
            ("Root bridges or caves", "Choose a root-bridge hike suited to your fitness and current trail conditions, with a local guide.", "Alternatively, visit an authorised cave tour if conditions and access permit.", "Keep the evening flexible after a full outdoor day.", "Wear grippy footwear and do not enter closed or flooded trails."),
            ("A slower final day", "Choose a nearby stop based on weather and your departure point.", "Keep the afternoon flexible for the onward journey.", "Pack and prepare for departure.", "Confirm road conditions and transport timing.")
        ],
        "andaman islands": [
            ("Arrive on the islands", "Arrive in Sri Vijaya Puram / Port Blair and check in.", "Visit the Cellular Jail area if opening times and tickets permit.", "Try local seafood or a regional meal at a reputable restaurant.", "Keep ferry and transfer plans flexible for weather-related changes."),
            ("History and coastal views", "Explore a local history or cultural stop in Sri Vijaya Puram.", "Check the current schedule for the Cellular Jail presentation if interested.", "Enjoy a relaxed dinner near your accommodation.", "Verify ticket availability and local transport."),
            ("Island transfer and beach time", "Take a pre-booked ferry to your chosen island only after confirming schedule.", "Visit a permitted beach such as Radhanagar Beach if staying on Swaraj Dweep / Havelock.", "Watch the sunset from a designated safe area.", "Ferry schedules can change; keep buffer time and follow beach safety advice."),
            ("Water and nature", "Choose a licensed snorkelling, diving or boat operator if sea conditions allow.", "Alternatively, enjoy a low-key beach or nature outing.", "Try a local meal and keep the evening unhurried.", "Do not enter the sea during warnings; never touch coral or marine wildlife."),
            ("Return and depart", "Allow plenty of time for your return transfer or ferry.", "Keep sightseeing close to your accommodation or transport hub.", "Prepare for departure.", "Check current ferry, flight, weather and baggage requirements.")
        ],
    }
    key = destination.casefold()
    plan = next((items for name, items in curated.items() if name in key or key in name), None)
    is_curated = plan is not None
    if plan is None:
        plan = [
            ("Arrive and get oriented", f"Arrive in {destination}, check in, and get familiar with the area around your stay.", f"Choose a well-known central attraction in {destination}; confirm current opening times before leaving.", "Try a regional dish at a well-reviewed local restaurant.", "Use a reputable taxi, transit service, or local operator; confirm fares first."),
            ("Explore the highlights", f"Start early at one of {destination}'s best-known sights.", f"Group two nearby attractions or a guided experience in {destination} to avoid unnecessary travel.", "Visit a local market or a scenic public area before dinner.", "Check route conditions and allow buffer time between stops."),
            ("Nature and local experiences", f"Choose a viewpoint, garden, waterfront, or nature walk suited to {destination}.", f"Explore a cultural site, craft area, or activity aligned with your interests: {interests}.", "Leave time for a relaxed meal and an unhurried neighborhood walk.", "Ask local tourism staff about current access and weather conditions."),
            ("Hidden corners", f"Ask a trusted local guide about a less-crowded place in {destination} that is open to visitors.", "Choose a short walk, small museum, craft workshop, or local experience.", "Enjoy a public, accessible viewpoint if weather permits.", "Do not enter restricted areas or attempt activities without qualified operators."),
            ("A slower final day", "Have breakfast and revisit a favourite nearby spot.", "Pick one remaining attraction close to your accommodation.", "Leave enough time to collect bags and prepare for departure.", "Confirm checkout, onward transport, and any ticket requirements.")
        ]
    itinerary = []
    for i in range(days):
        title, morning, afternoon, evening, getting = plan[i] if i < len(plan) else (
            f"Explore at your own pace — day {i+1}",
            f"Choose a suitable attraction in {destination} and confirm today's access.",
            f"Explore a nearby area matching your interests: {interests}.",
            "Keep the evening flexible for local food or a relaxed walk.",
            "Check current local transport, weather, and journey times before setting out."
        )
        itinerary.extend([f"Day {i+1}: {title}", f"Morning: {morning}", f"Afternoon: {afternoon}", f"Evening: {evening}", f"Getting around: {getting}", ""])
    status = (
        "Destination-aware fallback draft — local AI did not respond in time. "
        "Suggestions are planning starting points; verify current access, schedules, weather and prices before booking."
        if is_curated else
        "General fallback draft — local AI did not respond in time and no curated destination template is available. "
        "Check destination-specific details before booking."
    )
    raw = (
        f"SUMMARY:\nA {days}-day starter plan for {destination}, travelling from {origin}. "
        f"{'This draft uses a basic destination-specific template.' if is_curated else 'This draft uses general planning guidance, not verified destination-specific recommendations.'} "
        "Confirm details before booking.\n\n"
        "ITINERARY:\n" + "\n".join(itinerary) +
        "\nFOOD & CULTURE:\nExplore regional specialties and reputable local eateries; ask about ingredients and dietary needs. "
        "Venue names, opening hours, and prices have not been live-verified.\n\n"
        "PRACTICAL TIPS:\nCheck weather, attraction hours, transport schedules, and activity safety before setting out. "
        "For adventure activities, use qualified operators and follow local advisories."
    )
    sections = split_sections(raw)
    sections["Status"] = status
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
    origin = req.origin.strip() or "your starting point"
    query = (
        f"Plan a {req.days}-day trip from {origin} to {req.destination}. "
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
