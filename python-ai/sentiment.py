from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader = SentimentIntensityAnalyzer()

HIGH_RISK_KEYWORDS = [
    "want to die", "kill myself", "end it all", "no reason to live",
    "bunuh diri", "taknak hidup", "mati je", "hopeless forever",
    "can't go on", "give up on life", "better off dead",
]

MEDIUM_RISK_KEYWORDS = [
    "so depressed", "can't cope", "hate myself", "nobody cares",
    "completely alone", "no hope", "worthless", "give up",
]


def analyze_text(text: str) -> dict:
    scores = vader.polarity_scores(text)
    text_lower = text.lower()

    has_high_risk = any(kw in text_lower for kw in HIGH_RISK_KEYWORDS)
    has_medium_risk = any(kw in text_lower for kw in MEDIUM_RISK_KEYWORDS)

    if has_high_risk or scores["compound"] < -0.8:
        risk_level = "high"
    elif has_medium_risk or scores["compound"] < -0.5:
        risk_level = "medium"
    elif scores["compound"] < -0.2:
        risk_level = "low"
    else:
        risk_level = "none"

    return {
        "sentiment_score": round(scores["compound"], 4),
        "risk_level": risk_level,
        "positive": round(scores["pos"], 4),
        "negative": round(scores["neg"], 4),
        "neutral": round(scores["neu"], 4),
    }
