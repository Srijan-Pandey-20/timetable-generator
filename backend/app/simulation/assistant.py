from __future__ import annotations

from typing import Any


def fallback_assistant(question: str, scenario: dict[str, Any]) -> str:
    lower = question.lower()
    name = scenario.get("name", "this incident")
    if "what happened" in lower or "summary" in lower:
        return (
            f"{name} began with {scenario['initial_alert']}. The simulated evidence points to a sequence of "
            "compromised credentials, unusual access, and escalation of privileges within the fictional network."
        )
    if "investigate next" in lower or "next" in lower:
        return (
            "Recommended next step: review the authentication events tied to the user and compare them to the device "
            "and IP activity. Focus on the first successful sign-in after repeated failed attempts."
        )
    if "suspicious" in lower or "events" in lower:
        return (
            "The most suspicious signals are the repeated failed logins, the unfamiliar source IP, the successful sign-in "
            "after the failed attempts, and the unusual privilege request tied to the same user."
        )
    if "log" in lower:
        return "The log stream shows a change from failed login attempts to a successful authentication from an unusual source, followed by suspicious access and privilege activity."
    if "why" in lower and ("action" in lower or "useful" in lower):
        return "The action is useful because it reduces the chance of lateral movement and preserves the integrity of the evidence trail while the investigation continues."
    if "report" in lower:
        return (
            f"This report should explain the timeline, affected assets, evidence, response decision, containment steps, recovery actions, "
            f"and the simulated impact to {scenario.get('name', 'this incident')}."
        )
    return (
        "This assistant is operating in local simulation mode only and is using fictional incident data. It can help explain "
        "the timeline, suspicious events, and recommended investigation steps."
    )
