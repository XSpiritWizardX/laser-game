MODULE_NAME = "auto_feature_05"
REVISION = 5

FEATURE_BRIEF = {
    "title": "laser-game",
    "summary": "A focused product module.",
    "checkpoints": [
        "Define success metric",
        "Ship first user flow",
        "Instrument activation funnel",
    ],
}

def next_action() -> str:
    checkpoints = FEATURE_BRIEF.get("checkpoints", [])
    return checkpoints[0] if checkpoints else "Ship the MVP"
