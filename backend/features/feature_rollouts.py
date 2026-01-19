MODULE_NAME = "feature_rollouts"

FEATURE_FLAGS = {
    "onboarding_revamp": True,
    "pricing_experiment": False,
    "retention_alerts": True,
    "growth_playbooks": False,
}

def is_feature_enabled(key: str) -> bool:
    return bool(FEATURE_FLAGS.get(key))

def enabled_features() -> list[str]:
    return [key for key, enabled in FEATURE_FLAGS.items() if enabled]

FEATURE_SUMMARY = "Feature Rollouts"
