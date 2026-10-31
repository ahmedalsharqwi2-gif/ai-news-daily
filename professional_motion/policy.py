"""User-requested length: AI news shorts: 30s to under 180s."""
MIN_SECONDS=30.0
MAX_SECONDS=180.0
MIN_WORDS=80
MAX_WORDS=330

def require_duration(seconds):
    if not MIN_SECONDS<=float(seconds)<MAX_SECONDS:
        raise ValueError('AI news film must be at least 30 seconds and shorter than 180 seconds')
    return float(seconds)
