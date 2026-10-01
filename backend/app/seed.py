from __future__ import annotations

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Achievement, Scenario, Score, SimulationSession, User


def seed_demo_data() -> None:
    db: Session = SessionLocal()
    try:
        if db.query(Scenario).count() == 0:
            scenarios = [
                Scenario(
                    id="account-compromise",
                    name="Account Compromise",
                    severity="High",
                    description="Repeated authentication failures and suspicious access",
                    introduction="A suspicious account compromise was detected.",
                    initial_alert="Multiple failed logins followed by a successful sign-in from an unfamiliar IP.",
                    metadata={"category": "identity"},
                    evidence={"primary": ["repeated failed logins", "suspicious login"]},
                    decisions={"options": ["investigate", "disable-account", "block-source"]},
                    event_stream={"events": 5},
                ),
                Scenario(
                    id="phishing-incident",
                    name="Phishing Incident",
                    severity="Medium",
                    description="Employee clicked a malicious-looking email link.",
                    introduction="A malicious email was interacting with a user account.",
                    initial_alert="Unusual authentication followed a spoofed email click.",
                    metadata={"category": "phishing"},
                    evidence={"primary": ["email lure", "suspicious portal"]},
                    decisions={"options": ["investigate", "reset-password", "mark-suspicious"]},
                    event_stream={"events": 4},
                ),
            ]
            db.add_all(scenarios)

        if db.query(User).count() == 0:
            db.add_all(
                [
                    User(name="Aarav Mehta", role="Operations Manager", department="Operations", email="aarav@northstar.example", status="active", normal_behavior="Normal working hours and standard access", recent_activity="Reviewed deployment notes"),
                    User(name="Riya Sharma", role="Support Analyst", department="IT", email="riya@northstar.example", status="active", normal_behavior="Standard login patterns", recent_activity="Accessed helpdesk tools"),
                    User(name="Daniel Carter", role="Finance Lead", department="Finance", email="daniel@northstar.example", status="review", normal_behavior="Payslips and finance reports", recent_activity="Accessed budget approvals"),
                ]
            )
        if db.query(Achievement).count() == 0:
            db.add_all(
                [
                    Achievement(title="First Response", description="Completed your first incident.", unlocked_for="Demo Analyst"),
                    Achievement(title="Evidence Hunter", description="Inspected 10 relevant events.", unlocked_for="Demo Analyst"),
                ]
            )
        if db.query(SimulationSession).count() == 0:
            sample = SimulationSession(
                analyst_name="Demo Analyst",
                scenario_id="account-compromise",
                status="completed",
                response_time=3.8,
                actions_taken=8,
                incorrect_actions=1,
                evidence_discovered=7,
                systems_affected=3,
                estimated_impact="Low to moderate simulated impact",
                metadata={"completed": True},
            )
            db.add(sample)
            db.flush()
            db.add(Score(session_id=sample.id, detection=18, investigation=17, decision_quality=21, containment=18, recovery=10, business_impact=4, evidence_quality=11, total=88))
        db.commit()
    finally:
        db.close()
