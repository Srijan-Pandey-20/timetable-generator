from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str | None] = mapped_column(String(128), nullable=True)
    department: Mapped[str | None] = mapped_column(String(128), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(64), default="normal")
    normal_behavior: Mapped[str | None] = mapped_column(Text, nullable=True)
    recent_activity: Mapped[str | None] = mapped_column(Text, nullable=True)


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    asset_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(128), default="endpoint")
    environment: Mapped[str] = mapped_column(String(128), default="production")
    status: Mapped[str] = mapped_column(String(64), default="online")
    owner: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Identity(Base):
    __tablename__ = "identities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(64), default="user")
    department: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(64), default="normal")
    details: Mapped[str | None] = mapped_column(Text, nullable=True)


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="high")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    introduction: Mapped[str | None] = mapped_column(Text, nullable=True)
    initial_alert: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    evidence: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    decisions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    event_stream: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class EventLog(Base):
    __tablename__ = "event_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scenario_id: Mapped[str] = mapped_column(String(64), ForeignKey("scenarios.id"), index=True)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    source: Mapped[str] = mapped_column(String(128), nullable=False)
    event_type: Mapped[str] = mapped_column(String(128), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="medium")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    affected_entity: Mapped[str | None] = mapped_column(String(255), nullable=True)
    related_entities: Mapped[str | None] = mapped_column(Text, nullable=True)

    scenario: Mapped[Scenario] = relationship("Scenario")


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scenario_id: Mapped[str] = mapped_column(String(64), ForeignKey("scenarios.id"), index=True)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    consequence: Mapped[str] = mapped_column(Text, nullable=False)
    effects: Mapped[dict] = mapped_column(JSON, default={})
    was_selected: Mapped[bool] = mapped_column(default=False)


class SimulationSession(Base):
    __tablename__ = "simulation_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    analyst_name: Mapped[str] = mapped_column(String(255), default="Analyst")
    scenario_id: Mapped[str] = mapped_column(String(64), ForeignKey("scenarios.id"), index=True)
    status: Mapped[str] = mapped_column(String(64), default="active")
    response_time: Mapped[float | None] = mapped_column(Float, nullable=True)
    actions_taken: Mapped[int] = mapped_column(Integer, default=0)
    incorrect_actions: Mapped[int] = mapped_column(Integer, default=0)
    evidence_discovered: Mapped[int] = mapped_column(Integer, default=0)
    systems_affected: Mapped[int] = mapped_column(Integer, default=0)
    estimated_impact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("simulation_sessions.id"), index=True)
    detection: Mapped[float] = mapped_column(Float, default=0.0)
    investigation: Mapped[float] = mapped_column(Float, default=0.0)
    decision_quality: Mapped[float] = mapped_column(Float, default=0.0)
    containment: Mapped[float] = mapped_column(Float, default=0.0)
    recovery: Mapped[float] = mapped_column(Float, default=0.0)
    business_impact: Mapped[float] = mapped_column(Float, default=0.0)
    evidence_quality: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    unlocked_for: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
