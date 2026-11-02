"""Permanent owner-confirmed duration policy; never pad or speed-change narration."""
from .duration_rules import require_duration as _require
PROFILE="news"
MIN_SECONDS=60.0
MAX_SECONDS=180.0
MIN_WORDS=80
MAX_WORDS=330
def require_duration(seconds):
    return _require(seconds,PROFILE)
