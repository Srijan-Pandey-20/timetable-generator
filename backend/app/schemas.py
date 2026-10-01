from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ScenarioSummary(BaseModel):
    id: str
    name: str
    severity: str
    description: str | None = None
    introduction: str | None = None
    initial_alert: str | None = None


class EventItem(BaseModel):
    timestamp: str
    source: str
    event_type: str
    severity: str
    description: str
    affected_entity: str | None = None
    related_entities: str | None = None


class DecisionChoice(BaseModel):
    id: str
    label: str
    consequence: str
    effects: dict[str, int] = Field(default_factory=dict)


class ScenarioDetail(BaseModel):
    id: str
    name: str
    severity: str
    description: str | None = None
    introduction: str | None = None
    initial_alert: str | None = None
    evidence: list[str] = Field(default_factory=list)
    events: list[EventItem] = Field(default_factory=list)
    decisions: list[DecisionChoice] = Field(default_factory=list)
    assets: list[dict[str, Any]] = Field(default_factory=list)
    users: list[dict[str, Any]] = Field(default_factory=list)
    status: str = "active"


class ScenarioDecisionRequest(BaseModel):
    scenario_id: str
    decision_id: str


class LeaderboardEntry(BaseModel):
    analyst_name: str
    score: float
    scenario: str
    response_time: float | None = None
    date: str
