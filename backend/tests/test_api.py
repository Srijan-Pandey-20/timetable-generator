from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_healthcheck() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_scenarios_loaded() -> None:
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 4
    assert {scenario["id"] for scenario in payload} >= {"account-compromise", "phishing-incident", "ransomware-simulation", "insider-threat"}


def test_case_details_available() -> None:
    response = client.get("/api/scenarios/account-compromise")
    assert response.status_code == 200
    payload = response.json()
    assert payload["name"] == "Account Compromise"
    assert len(payload["decisions"]) >= 2


def test_decision_updates_score() -> None:
    session = client.post("/api/scenarios/start", json={"scenario_id": "account-compromise", "analyst_name": "Tester"})
    session_id = session.json()["session_id"]
    response = client.post(f"/api/sessions/{session_id}/decision", json={"scenario_id": "account-compromise", "decision_id": "disable-account", "analyst_name": "Tester"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["score"]["total"] >= 50
    assert payload["session"]["actions_taken"] >= 1


def test_assistant_summarizes_incident() -> None:
    response = client.get("/api/assistant", params={"question": "What happened?", "scenario_id": "account-compromise"})
    assert response.status_code == 200
    assert "simulated" in response.json()["answer"].lower()


def test_demo_endpoint_available() -> None:
    response = client.get("/api/demo")
    assert response.status_code == 200
    payload = response.json()
    assert payload["demo_mode"] is True
