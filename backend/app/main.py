from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.database import SessionLocal, init_db
from app.models import Achievement, Score, SimulationSession
from app.simulation.assistant import fallback_assistant
from app.simulation.scenarios import SCENARIOS, apply_decision, calculate_score, create_demo_session, get_scenario_by_id, get_scenarios

app = FastAPI(title="CyberOps", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ACTIVE_SESSIONS: dict[str, dict[str, Any]] = {}


class SessionRequest(BaseModel):
    analyst_name: str | None = None
    scenario_id: str | None = None


class DecisionRequest(BaseModel):
    scenario_id: str
    decision_id: str
    analyst_name: str | None = None


class LeaderboardRecord(BaseModel):
    analyst_name: str
    score: float
    scenario: str
    response_time: float | None = None


@app.on_event("startup")
def startup() -> None:
    init_db()
    ACTIVE_SESSIONS.clear()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/scenarios")
def list_scenarios() -> list[dict[str, Any]]:
    return [
        {
            "id": scenario["id"],
            "name": scenario["name"],
            "severity": scenario["severity"],
            "description": scenario["description"],
            "introduction": scenario["introduction"],
            "initial_alert": scenario["initial_alert"],
        }
        for scenario in get_scenarios()
    ]


@app.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: str) -> dict[str, Any]:
    scenario = get_scenario_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {
        "id": scenario["id"],
        "name": scenario["name"],
        "severity": scenario["severity"],
        "description": scenario["description"],
        "introduction": scenario["introduction"],
        "initial_alert": scenario["initial_alert"],
        "evidence": scenario.get("evidence", []),
        "events": scenario.get("events", []),
        "decisions": scenario.get("decisions", []),
        "assets": scenario.get("assets", []),
        "users": scenario.get("users", []),
        "status": "active",
    }


@app.post("/api/scenarios/start")
def start_scenario(payload: SessionRequest) -> dict[str, Any]:
    scenario_id = payload.scenario_id or "account-compromise"
    scenario = get_scenario_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    session_id = f"session-{datetime.utcnow().timestamp()}"
    session = {
        "session_id": session_id,
        "scenario_id": scenario_id,
        "analyst_name": payload.analyst_name or "Analyst",
        "score": calculate_score(detection=12, investigation=10, decision_quality=14, containment=8, recovery=5, business_impact=3, evidence_quality=9),
        "events": scenario.get("events", []),
        "status": "investigating",
        "actions_taken": 0,
        "incorrect_actions": 0,
        "evidence_discovered": 0,
        "systems_affected": len(scenario.get("assets", [])),
        "estimated_impact": "Moderate simulated impact",
        "demo_mode": False,
    }
    ACTIVE_SESSIONS[session_id] = session
    return session


@app.post("/api/sessions/{session_id}/decision")
def apply_session_decision(session_id: str, payload: DecisionRequest) -> dict[str, Any]:
    scenario = get_scenario_by_id(payload.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    try:
        outcome = apply_decision(scenario, payload.decision_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    session = ACTIVE_SESSIONS.get(session_id)
    if not session:
        session = {
            "session_id": session_id,
            "scenario_id": payload.scenario_id,
            "analyst_name": payload.analyst_name or "Analyst",
            "events": scenario.get("events", []),
            "score": {"total": 0, "breakdown": {}},
            "status": "investigating",
            "actions_taken": 0,
            "incorrect_actions": 0,
            "evidence_discovered": 0,
            "systems_affected": len(scenario.get("assets", [])),
            "estimated_impact": "Moderate simulated impact",
            "demo_mode": False,
        }
        ACTIVE_SESSIONS[session_id] = session

    session["actions_taken"] += 1
    session["status"] = "contained" if outcome["score"]["total"] >= 70 else "investigating"
    session["score"] = outcome["score"]
    session["evidence_discovered"] = max(session.get("evidence_discovered", 0), 4)
    return {
        "message": outcome["decision"]["consequence"],
        "decision": outcome["decision"],
        "score": outcome["score"],
        "session": session,
    }


@app.get("/api/assistant")
def cyberops_assistant(question: str, scenario_id: str) -> dict[str, str]:
    scenario = get_scenario_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {
        "answer": fallback_assistant(question, scenario),
        "label": "AI-generated explanation (simulated)",
    }


@app.get("/api/demo")
def demo() -> dict[str, Any]:
    return create_demo_session()


@app.get("/api/analytics")
def analytics() -> dict[str, Any]:
    return {
        "scenarios_completed": 18,
        "average_score": 86,
        "average_response_time": 4.4,
        "detection_accuracy": 91,
        "investigation_accuracy": 88,
        "containment_performance": 90,
        "most_common_mistakes": ["Ignoring suspicious alerts", "Delayed user containment"],
        "scenario_completion_rate": 94,
    }


@app.get("/api/leaderboard")
def leaderboard() -> list[dict[str, Any]]:
    return [
        {"analyst_name": "Aarav Mehta", "score": 92, "scenario": "Account Compromise", "response_time": 3.8, "date": "2026-10-01"},
        {"analyst_name": "Riya Sharma", "score": 88, "scenario": "Phishing Incident", "response_time": 4.5, "date": "2026-10-01"},
        {"analyst_name": "Maya Rodriguez", "score": 85, "scenario": "Ransomware Simulation", "response_time": 5.1, "date": "2026-10-01"},
    ]


@app.post("/api/leaderboard")
def save_leaderboard(entry: LeaderboardRecord) -> dict[str, Any]:
    return {"success": True, "entry": entry.model_dump()}


@app.get("/api/achievements")
def achievements() -> list[dict[str, str]]:
    return [
        {"title": "First Response", "description": "Completed your first incident."},
        {"title": "Evidence Hunter", "description": "Inspected 10 relevant events."},
        {"title": "Fast Containment", "description": "Contained an incident quickly."},
    ]


@app.get("/api/scenario/{scenario_id}/report")
def generate_report(scenario_id: str) -> dict[str, Any]:
    scenario = get_scenario_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {
        "executive_summary": f"{scenario['name']} was contained using a defensive and evidence-driven response.",
        "incident_classification": scenario['name'],
        "timeline": scenario.get('events', []),
        "affected_assets": [asset['name'] for asset in scenario.get('assets', [])],
        "indicators": scenario.get('evidence', []),
        "actions_taken": ["Evidence review", "Decision evaluation", "Containment and recovery"],
        "containment": "Scenario containment actions were applied following the decision engine.",
        "recovery": "Recovery was simulated using controlled restoration and root-cause verification.",
        "impact": "Impact was measured in a fictional environment only.",
        "lessons_learned": ["Investigate abnormal authentication patterns", "Confirm identity-related anomalies before escalation"],
        "analyst_performance": "Simulation score demonstrates defensive response quality.",
    }


@app.get("/api/seed")
def seed_status() -> dict[str, Any]:
    return {"status": "ready", "scenarios_loaded": len(SCENARIOS)}


__all__ = ["app"]
