# CYBEROPS

Interactive Cyber Incident Response Simulator

## Project Overview

CYBEROPS is a fictional, simulated security operations center designed to teach the fundamentals of incident detection, investigation, containment, recovery, and decision-making without using real attack tooling or real-world infrastructure. The application provides a polished SOC dashboard, four incident scenarios, interactive evidence review, analytics, a local AI explanation assistant, and a demo-ready experience for live presentation.

## Problem Statement

Many cybersecurity training platforms focus on static screenshots or theoretical content. CYBEROPS turns the learning experience into an interactive decision-making simulation so trainees can observe how alerts, logs, user behavior, and asset relationships combine to reveal a real incident pattern.

## Features

- Dark SOC-style landing page and dashboard
- Four playable incident scenarios
- Timeline, logs, user, asset, and indicator investigation
- Multiple response decisions with consequences and score changes
- Simulated final score and report generation
- Local AI-style assistant that only uses fictional incident data
- Training mode, analytics, leaderboard, achievements, and demo mode
- SQLite-backed local persistence for analytics and leaderboard entries

## Architecture

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + Pydantic + SQLAlchemy ORM
- Database: SQLite
- Simulation engine: deterministic scenario logic and score calculations
- AI assistant: local fallback explanation service that uses simulated data only

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Framer Motion
- FastAPI
- SQLAlchemy
- SQLite
- Pytest
- Vitest + React Testing Library

## Database Schema

The project uses a small SQLAlchemy model layer to represent operational entities:

- User
- Scenario
- EventLog
- Decision
- SimulationSession
- Score
- Achievement
- Asset
- Identity

## Simulation Engine

The simulation engine is implemented as a deterministic set of scenario definitions and decision consequences. Every scenario includes:

- introduction
- initial alert
- generated event timeline
- evidence items
- investigation steps
- response decisions
- score-impacting consequences
- recovery and containment guidance

## AI Assistant

The assistant is intentionally local and deterministic. It does not use a live LLM by default and does not provide real-world offensive guidance. It only explains the fictional incident data and suggests what to investigate next.

## Security Boundaries

This application is defensive and educational only. It never performs real network scans, credential theft, exploit automation, or live attack actions. All identifiers, IPs, assets, and logs remain fictional or reserved example data.

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install backend dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Configure environment (optional)

```bash
cp .env.example .env
```

## Running the Application

### Start the backend

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open the frontend in the browser at `http://localhost:5173`.

## Testing

### Backend tests

```bash
cd backend
pytest -q
```

### Frontend tests

```bash
cd frontend
npm run test -- --run
```

### Frontend build

```bash
cd frontend
npm run build
```

## Demo Instructions

1. Open the landing page.
2. Start a scenario such as Account Compromise.
3. Review the initial alert and event stream.
4. Click timeline entries to inspect evidence.
5. Make a decision and examine the score impact.
6. Start Demo Mode for a fast five-minute event flow.
7. Review the final incident report and analytics.

## Project Structure

```text
.
├── backend/
│   ├── app/
│   ├── tests/
│   └── data/
├── docs/
├── frontend/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── requirements.txt
└── ...
```

## Future Improvements

- Add more scenarios and custom scenario editing controls
- Expose a richer incident graph and timeline editor
- Add optional LLM integration behind a safe, opt-in configuration
- Expand analytics and milestone tracking for learners
- Add authentication to support multiple analyst profiles

## How GitHub Copilot Accelerated Development

GitHub Copilot accelerated this project across several concrete areas:

- component generation for a polished SOC interface
- API scaffolding for FastAPI endpoints and schemas
- test generation for backend and frontend validation
- refactoring repeated UI sections into reusable patterns
- documentation generation for README and architecture notes
- debugging front-end and backend startup issues
- UI iteration for a more polished and demo-friendly experience

This project was shaped by a human-led engineering process, not by a claim that automation built the entire system without oversight.

## Security and Safety Notes

This project is designed for educational training and safe demonstration. It intentionally avoids real offensive cyber capabilities and keeps all simulation data clearly fictional.
