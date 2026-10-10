# backend/main.py
import io
import textwrap
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


# ---- Your existing logic (UNCHANGED) ----
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import PromptTemplate
from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="mistral")
chat_history = ChatMessageHistory()

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

Keep answers structured, friendly, practical, and specific to the destination. Follow this exact format so the app can display the plan by day:

SUMMARY:
Give a short overview of the trip and explain any assumptions.

ITINERARY:
Day 1: A short, destination-specific title
Morning: named place or activity, approximate duration, and a practical note.
Afternoon: named place or activity, approximate duration, and a practical note.
Evening: named place or activity, local food suggestion, or sunset option.
Getting around: explain realistic local transport between these stops. Do not invent exact travel times or distances; label estimates clearly.

Repeat the Day N format for every requested day. Make each day different, group nearby attractions together, avoid overpacking, and use the user's interests and budget. If a venue or activity cannot be verified, clearly say it needs checking before travel. Do not claim bookings, opening hours, live prices, or availability are verified.

FOOD & CULTURE:
Suggest destination-relevant dishes and where/which kind of area visitors could look for them. Mark venue names as suggestions, not verified recommendations.

PRACTICAL TIPS:
Include weather/packing, safety, local transport, and booking checks relevant to the destination.

Conversation so far:
{chat_history}

User question:
{question}

AI Travel Assistant:
"""
)

def run_chain(question):
    chat_history_text = "\n".join(
        [f"{msg.type.capitalize()}: {msg.content}" for msg in chat_history.messages]
    )
    prompt_text = travel_prompt.format(
        chat_history=chat_history_text,
        question=question
    )
    response = llm.invoke(prompt_text)
    chat_history.add_user_message(question)
    chat_history.add_ai_message(response)
    return response

def split_sections(text):
    sections = {}
    lines = text.strip().splitlines()
    current = "Summary"
    sections[current] = []
    for ln in lines:
        ln_stripped = ln.strip().lower()
        if ln_stripped.startswith("itinerary"):
            current = "Itinerary"; sections[current] = []; continue
        if ln_stripped.startswith("food"):
            current = "Food & Culture"; sections[current] = []; continue
        if ln_stripped.startswith("practical") or ln_stripped.startswith("tips"):
            current = "Practical Tips"; sections[current] = []; continue
        if ln_stripped.startswith("summary"):
            current = "Summary"; sections[current] = []; continue
        sections.setdefault(current, []).append(ln)
    return {k: "\n".join(v).strip() for k, v in sections.items()}

# ---- API Layer (NEW, UI-agnostic) ----
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TravelRequest(BaseModel):
    origin: str
    destination: str
    days: int
    style: str
    preferences: str

@app.post("/generate")
def generate(req: TravelRequest):
    query = (
        f"Plan a {req.days}-day trip from {req.origin} to {req.destination}. "
        f"Travel style: {req.style}. Preferences: {req.preferences}."
    )
    query += (
        "\nReturn exactly the headings SUMMARY:, ITINERARY:, FOOD & CULTURE:, and PRACTICAL TIPS:. "
        "Under ITINERARY, include one clearly labelled Day 1 through Day " + str(req.days) +
        " with Morning, Afternoon, Evening, and Getting around entries for each day."
    )
    raw = run_chain(query)
    sections = split_sections(raw)
    return {
        "raw": raw,
        "sections": sections
    }
