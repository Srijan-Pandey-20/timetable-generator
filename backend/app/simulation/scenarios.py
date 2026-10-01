from __future__ import annotations

from copy import deepcopy
from typing import Any


SCENARIOS = [
    {
        "id": "account-compromise",
        "name": "Account Compromise",
        "severity": "High",
        "description": "Repeated authentication failures and a suspicious successful sign-in indicate credential abuse.",
        "introduction": "A finance analyst's account shows a rapid sequence of failed logins followed by a successful authentication from an unfamiliar location.",
        "initial_alert": "Multiple failed authentication attempts from a single account followed by a successful login from an unfamiliar IP.",
        "evidence": [
            "The user account shows nine failed login attempts within two minutes.",
            "The successful authentication came from an unfamiliar IP range in Prague.",
            "The user accessed a finance workstation and attempted a privilege elevation request.",
            "Sensitive payroll files were opened after the suspicious sign-in."
        ],
        "users": [
            {"name": "J. Smith", "role": "Finance Analyst", "department": "Finance", "status": "at-risk"},
            {"name": "M. Ortega", "role": "IT Admin", "department": "Security", "status": "normal"},
            {"name": "S. Nair", "role": "Developer", "department": "Engineering", "status": "normal"}
        ],
        "assets": [
            {"name": "FIN-WS-03", "category": "endpoint", "environment": "production", "status": "compromised"},
            {"name": "DB-PROD-01", "category": "database", "environment": "production", "status": "sensitive"},
            {"name": "FILE-SRV-01", "category": "storage", "environment": "production", "status": "investigating"}
        ],
        "events": [
            {"timestamp": "2026-10-01 10:31:04", "source": "Authentication Gateway", "event_type": "Failed Login", "severity": "medium", "description": "Multiple failed authentication attempts for the user j.smith.", "affected_entity": "j.smith", "related_entities": "FIN-WS-03"},
            {"timestamp": "2026-10-01 10:32:11", "source": "Network Monitor", "event_type": "Suspicious Connection", "severity": "high", "description": "Authentication attempts originated from a geographic region outside the user's normal location.", "affected_entity": "10.20.4.15", "related_entities": "j.smith;FIN-WS-03"},
            {"timestamp": "2026-10-01 10:34:27", "source": "IAM System", "event_type": "Successful Authentication", "severity": "critical", "description": "Successful authentication followed repeated failures from an unfamiliar location.", "affected_entity": "j.smith", "related_entities": "10.20.4.15"},
            {"timestamp": "2026-10-01 10:35:02", "source": "Database Monitor", "event_type": "Abnormal Access", "severity": "high", "description": "Unusual database queries were made from the finance workstation after the login.", "affected_entity": "DB-PROD-01", "related_entities": "j.smith;FIN-WS-03"},
            {"timestamp": "2026-10-01 10:36:18", "source": "Privilege Service", "event_type": "Privilege Escalation", "severity": "critical", "description": "The account attempted a privilege escalation request to access payroll exports.", "affected_entity": "j.smith", "related_entities": "DB-PROD-01;FILE-SRV-01"}
        ],
        "decisions": [
            {"id": "investigate", "label": "Investigate authentication logs", "consequence": "You verified the sequence of repeated failures and the unfamiliar sign-in without isolating the account immediately.", "effects": {"detection": 4, "investigation": 6, "decision_quality": 4, "containment": -1, "recovery": 1}},
            {"id": "disable-account", "label": "Disable the account", "consequence": "The account was disabled right away, containing the threat quickly but interrupting several payroll processes.", "effects": {"detection": 3, "containment": 7, "decision_quality": 5, "business_impact": -2, "recovery": 2}},
            {"id": "ignore", "label": "Ignore the alert", "consequence": "The incident worsened as additional access and privilege requests were observed.", "effects": {"detection": -2, "investigation": -2, "decision_quality": -4, "containment": -5, "recovery": -3, "business_impact": -3}},
            {"id": "block-source", "label": "Block the source IP", "consequence": "The attempted external connection was blocked, reducing but not eliminating the risk of credential abuse.", "effects": {"detection": 3, "containment": 5, "decision_quality": 4, "recovery": 1}}
        ]
    },
    {
        "id": "phishing-incident",
        "name": "Phishing Incident",
        "severity": "Medium",
        "description": "A phishing lure caused a user to interact with a malicious-looking portal and triggered unusual authentication behavior.",
        "introduction": "An employee clicked an email link that redirected them to a spoofed portal, and suspicious login activity followed immediately.",
        "initial_alert": "An employee clicked a deceptive email and then performed an unexpected credential-driven login to a policy portal.",
        "evidence": [
            "The suspicious email arrived from a domain resembling the vendor's invoice notification system.",
            "The user visited a spoofed login portal that mimicked the internal SSO provider.",
            "The next authentication attempt was made from a new browser session and unusual location.",
            "The account attempted to access payment and identity management portals."
        ],
        "users": [
            {"name": "Aarav Mehta", "role": "Operations Manager", "department": "Operations", "status": "compromised"},
            {"name": "Riya Sharma", "role": "IT Support", "department": "IT", "status": "normal"},
            {"name": "Daniel Carter", "role": "Sales Executive", "department": "Sales", "status": "normal"}
        ],
        "assets": [
            {"name": "HR-WS-01", "category": "endpoint", "environment": "production", "status": "at-risk"},
            {"name": "FILE-SRV-01", "category": "storage", "environment": "production", "status": "reviewing"},
            {"name": "IAM-PROD-02", "category": "identity", "environment": "production", "status": "monitoring"}
        ],
        "events": [
            {"timestamp": "2026-10-01 09:48:20", "source": "Email Gateway", "event_type": "Suspicious Email", "severity": "medium", "description": "A spoofed invoice email was delivered to a regional operations manager.", "affected_entity": "Aarav Mehta", "related_entities": "invoice@northstar-tech.example"},
            {"timestamp": "2026-10-01 09:51:04", "source": "Proxy Log", "event_type": "User Interaction", "severity": "high", "description": "The user clicked a link and visited a fake single sign-on portal.", "affected_entity": "Aarav Mehta", "related_entities": "HR-WS-01"},
            {"timestamp": "2026-10-01 09:52:41", "source": "IAM System", "event_type": "Unusual Authentication", "severity": "critical", "description": "An authentication event occurred outside the user's normal working pattern and browser fingerprint.", "affected_entity": "Aarav Mehta", "related_entities": "IAM-PROD-02"},
            {"timestamp": "2026-10-01 09:54:32", "source": "Access Monitor", "event_type": "Account Anomaly", "severity": "critical", "description": "The affected account attempted to access privileged identity records and file shares.", "affected_entity": "Aarav Mehta", "related_entities": "FILE-SRV-01;IAM-PROD-02"}
        ],
        "decisions": [
            {"id": "mark-suspicious", "label": "Mark the email as suspicious and isolate the user", "consequence": "The suspicious message and user account were contained while the investigation continued.", "effects": {"detection": 5, "containment": 6, "decision_quality": 4, "business_impact": -1, "recovery": 1}},
            {"id": "reset-password", "label": "Reset credentials and block access", "consequence": "The password reset disrupted the phishing flow and protected the identity platform.", "effects": {"detection": 4, "containment": 6, "decision_quality": 5, "recovery": 2}},
            {"id": "ignore", "label": "Ignore the suspicious activity", "consequence": "The account continued to access sensitive systems, increasing the incident impact.", "effects": {"detection": -3, "containment": -5, "decision_quality": -4, "business_impact": -3}},
            {"id": "investigate", "label": "Review the email and identity logs", "consequence": "The investigation identified the spoofed portal but did not immediately stop the user from interacting with the account.", "effects": {"detection": 4, "investigation": 5, "decision_quality": 3, "containment": 1}}
        ]
    },
    {
        "id": "ransomware-simulation",
        "name": "Ransomware Simulation",
        "severity": "Critical",
        "description": "A suspicious endpoint process and rapid file encryption attempts point to a ransomware-like event in a fictional environment.",
        "introduction": "The security team observed an unusual process on an endpoint that rapidly modified a large set of files and triggered a containment alarm.",
        "initial_alert": "An endpoint is creating unusual encryption-like file modifications and an abrupt rise in I/O activity.",
        "evidence": [
            "A process began unusual file modifications on a user workstation after a scheduled maintenance task.",
            "The endpoint attempted to access a shared drive and changed file hashes on sensitive data.",
            "There was a spike in file rename operations and storage writes across the network.",
            "The process matched a fictional malware pattern designed for training only."
        ],
        "users": [
            {"name": "Maya Rodriguez", "role": "Developer", "department": "Engineering", "status": "targeted"},
            {"name": "N. Hassan", "role": "Systems Engineer", "department": "Infrastructure", "status": "normal"}
        ],
        "assets": [
            {"name": "DEV-SRV-02", "category": "server", "environment": "production", "status": "encrypted"},
            {"name": "FILE-SRV-01", "category": "storage", "environment": "production", "status": "critical"},
            {"name": "HR-WS-01", "category": "endpoint", "environment": "production", "status": "isolated"}
        ],
        "events": [
            {"timestamp": "2026-10-01 11:03:12", "source": "EDR Agent", "event_type": "Suspicious Process", "severity": "critical", "description": "An uncommon process created a fast sequence of file modifications and writes on a developer workstation.", "affected_entity": "DEV-SRV-02", "related_entities": "Maya Rodriguez"},
            {"timestamp": "2026-10-01 11:04:28", "source": "File Monitor", "event_type": "File Activity", "severity": "critical", "description": "Rapid rename and write operations were observed across a shared repository.", "affected_entity": "FILE-SRV-01", "related_entities": "DEV-SRV-02"},
            {"timestamp": "2026-10-01 11:05:09", "source": "EDR Agent", "event_type": "Endpoint Isolation", "severity": "high", "description": "The endpoint triggered a potential containment action because of suspicious file behavior.", "affected_entity": "HR-WS-01", "related_entities": "DEV-SRV-02"},
            {"timestamp": "2026-10-01 11:07:03", "source": "Recovery Orchestrator", "event_type": "Recovery", "severity": "medium", "description": "The response team began restoring from a known-good backup and validating integrity.", "affected_entity": "FILE-SRV-01", "related_entities": "DEV-SRV-02"}
        ],
        "decisions": [
            {"id": "isolate-endpoint", "label": "Isolate the endpoint immediately", "consequence": "The endpoint contained the event before it could spread to critical file shares.", "effects": {"detection": 5, "containment": 8, "decision_quality": 5, "recovery": 2, "business_impact": -1}},
            {"id": "recover-fast", "label": "Recover from backup and validate files", "consequence": "The team restored files and verified integrity rapidly with minimal downtime.", "effects": {"recovery": 7, "containment": 3, "decision_quality": 5, "business_impact": 1}},
            {"id": "ignore", "label": "Ignore the process until all evidence is reviewed", "consequence": "The rapid file changes continued and the threat expanded to a shared storage asset.", "effects": {"detection": -2, "containment": -6, "decision_quality": -4, "business_impact": -4}},
            {"id": "reboot", "label": "Reboot the affected service", "consequence": "The reboot halted the process but caused brief disruption to the development platform.", "effects": {"containment": 4, "decision_quality": 2, "business_impact": -2}}
        ]
    },
    {
        "id": "insider-threat",
        "name": "Insider Threat",
        "severity": "High",
        "description": "Unusual access outside working hours and abnormal file downloads suggest an insider risk involving sensitive data access.",
        "introduction": "A user with access to sensitive finance and HR documents is showing unusual after-hours activity and suspicious file downloads.",
        "initial_alert": "A finance systems administrator is downloading a large volume of sensitive records during unusual hours.",
        "evidence": [
            "The user accessed sensitive files after 1:00 AM and outside the normal business cycle.",
            "The download volume exceeded the user's historical baseline by more than 300 percent.",
            "The user used administrator privileges to access files unrelated to their role.",
            "The access pattern was tied to a contractor account that required review."
        ],
        "users": [
            {"name": "L. Brooks", "role": "Systems Administrator", "department": "IT", "status": "suspect"},
            {"name": "Maya Rodriguez", "role": "Developer", "department": "Engineering", "status": "normal"},
            {"name": "Riya Sharma", "role": "IT Support", "department": "IT", "status": "normal"}
        ],
        "assets": [
            {"name": "FILE-SRV-01", "category": "storage", "environment": "production", "status": "sensitive"},
            {"name": "DB-PROD-01", "category": "database", "environment": "production", "status": "reviewing"},
            {"name": "FIN-WS-03", "category": "endpoint", "environment": "production", "status": "investigating"}
        ],
        "events": [
            {"timestamp": "2026-10-01 00:41:30", "source": "Audit Log", "event_type": "Unusual Access", "severity": "high", "description": "Use of HR and finance repositories occurred outside the user's normal hours.", "affected_entity": "L. Brooks", "related_entities": "FILE-SRV-01"},
            {"timestamp": "2026-10-01 00:52:13", "source": "Data Monitor", "event_type": "Large Download", "severity": "critical", "description": "A large volume of documents was exported from a sensitive file server.", "affected_entity": "FILE-SRV-01", "related_entities": "L. Brooks;DB-PROD-01"},
            {"timestamp": "2026-10-01 00:58:42", "source": "Privileged Access", "event_type": "Privilege Usage", "severity": "critical", "description": "Privileged access was used to reach accounts outside the user's normal responsibilities.", "affected_entity": "L. Brooks", "related_entities": "FIN-WS-03;DB-PROD-01"},
            {"timestamp": "2026-10-01 01:09:15", "source": "HR Systems", "event_type": "Escalation Decision", "severity": "high", "description": "The investigation team was prompted to review escalation and legal compliance implications.", "affected_entity": "L. Brooks", "related_entities": "FILE-SRV-01;HR-WS-01"}
        ],
        "decisions": [
            {"id": "escalate", "label": "Escalate to security leadership and suspend access", "consequence": "The response team immediately suspended the account and preserved evidence for the investigation.", "effects": {"detection": 5, "containment": 7, "decision_quality": 6, "investigation": 4, "business_impact": -1}},
            {"id": "investigate", "label": "Investigate the account and verify business need", "consequence": "The review confirmed the activity was abnormal but it did not immediately contain the data access.", "effects": {"detection": 4, "investigation": 6, "decision_quality": 3, "containment": 1}},
            {"id": "ignore", "label": "Ignore the after-hours activity", "consequence": "The risk intensified as privileged access continued in the early morning hours.", "effects": {"detection": -3, "containment": -5, "decision_quality": -4, "business_impact": -4}},
            {"id": "revoke-privilege", "label": "Revoke administrative privileges only", "consequence": "Privilege removal stopped the abusive access without fully isolating the account.", "effects": {"containment": 5, "decision_quality": 4, "recovery": 2, "business_impact": -1}}
        ]
    }
]


def get_scenarios() -> list[dict[str, Any]]:
    return deepcopy(SCENARIOS)


def get_scenario_by_id(scenario_id: str) -> dict[str, Any] | None:
    for scenario in SCENARIOS:
        if scenario["id"] == scenario_id:
            return deepcopy(scenario)
    return None


def calculate_score(*, detection: int, investigation: int, decision_quality: int, containment: int, recovery: int, business_impact: int, evidence_quality: int) -> dict[str, Any]:
    categories = {
        "Detection": detection,
        "Investigation": investigation,
        "Decision Making": decision_quality,
        "Containment": containment,
        "Recovery": recovery,
        "Business Impact": business_impact,
        "Evidence Quality": evidence_quality,
    }
    total = sum(categories.values())
    return {
        "total": max(0, min(100, total)),
        "breakdown": categories,
    }


def apply_decision(scenario: dict[str, Any], decision_id: str) -> dict[str, Any]:
    selected = None
    for option in scenario.get("decisions", []):
        if option["id"] == decision_id:
            selected = option
            break
    if not selected:
        raise ValueError("Decision not found")
    effects = selected.get("effects", {})
    base = {
        "detection": 18,
        "investigation": 15,
        "decision_quality": 18,
        "containment": 12,
        "recovery": 8,
        "business_impact": 4,
        "evidence_quality": 10,
    }
    for key, value in effects.items():
        if key in base:
            base[key] = max(0, min(25, base[key] + value))
    score = calculate_score(**base)
    return {
        "decision": selected,
        "score": score,
        "status": "updated",
    }


def create_demo_session() -> dict[str, Any]:
    scenario = get_scenario_by_id("account-compromise") or SCENARIOS[0]
    return {
        "scenario": scenario,
        "score": calculate_score(detection=18, investigation=17, decision_quality=21, containment=18, recovery=10, business_impact=4, evidence_quality=11),
        "demo_mode": True,
    }
