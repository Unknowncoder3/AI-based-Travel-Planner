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
    raw = run_chain(query)
    sections = split_sections(raw)
    return {
        "raw": raw,
        "sections": sections
    }
