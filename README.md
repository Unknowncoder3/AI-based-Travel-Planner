# AI-based-Travel-Planner
AI-Powered Travel Planner 🌍✨  An end-to-end AI travel planning assistant that combines LLMs, voice interfaces, and a modern UI to deliver personalized trip itineraries. The application uses LangChain with Ollama for local model inference and supports conversational memory, voice interaction, and itinerary exports.
AI Travel Planner Assistant 🌍🧠

AI Travel Planner is an intelligent travel planning application that helps users create personalized trip itineraries using large language models (LLMs). The assistant supports both text and voice input, maintains conversation history, and generates structured travel plans including routes, attractions, food suggestions, and practical travel tips.

The system leverages LangChain with Ollama (Mistral / LLaMA) for local LLM inference and is built using Python with a modern, animated UI.

✨ Features

🗺️ Personalized travel planning (origin → destination)

🧠 LLM-powered itinerary generation (routes, hidden gems, food & culture)

🎤 Voice input support (Speech Recognition)

🔊 Text-to-Speech output

💬 Persistent chat history

🧳 User profile with saved trips

📄 Downloadable itineraries (TXT / PDF)

🎨 Modern UI with animations and responsive design

🖥️ Local LLM inference using Ollama (no cloud dependency)

🛠️ Tech Stack

Python

Streamlit

LangChain

Ollama (Mistral / LLaMA models)

SpeechRecognition

pyttsx3

FPDF

HTML / CSS (custom UI styling)

🚀 How It Works

User enters a starting location and destination (or uses voice input)

The system builds a structured travel prompt

LangChain sends the prompt to an LLM via Ollama

The AI generates a detailed, human-friendly travel plan

Results are displayed, spoken aloud, saved, or downloaded

📦 Use Cases

Trip planning & itinerary creation

AI travel assistant demos

LLM + voice interface projects

Smart tourism applications

⚠️ Notes

Requires Ollama installed locally for LLM inference

Voice input depends on microphone availability

Designed for experimentation and learning; can be extended to a full-stack web app
