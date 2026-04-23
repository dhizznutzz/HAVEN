from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader = SentimentIntensityAnalyzer()

HIGH_RISK_KEYWORDS = [
    "want to die", "kill myself", "end it all", "no reason to live",
    "bunuh diri", "taknak hidup", "mati je", "hopeless forever",
    "can't go on", "give up on life", "better off dead",
    "not worth living", "want to disappear forever", "nobody cares",
    "mati je lah", "dah tak larat", "tiada harapan", "tak berguna",
    "semua benci aku",
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


def analyze_text_detailed(text: str) -> dict:
    """
    Full sentiment + risk + emotion analysis for Guardian module.
    Supports English and Malay text.
    """
    text_lower = text.lower().strip()

    # Detect language (best-effort, fallback to 'en')
    lang = "en"
    try:
        from langdetect import detect
        lang = detect(text)
    except Exception:
        pass

    scores = vader.polarity_scores(text)
    compound = scores["compound"]

    # Subjectivity via TextBlob (fallback to 0.5 if unavailable)
    subjectivity = 0.5
    try:
        from textblob import TextBlob
        subjectivity = TextBlob(text).sentiment.subjectivity
    except Exception:
        pass

    has_high_risk = any(kw in text_lower for kw in HIGH_RISK_KEYWORDS)
    has_medium_risk = any(kw in text_lower for kw in MEDIUM_RISK_KEYWORDS)

    if has_high_risk or compound <= -0.8:
        risk_level = "high"
    elif has_medium_risk or compound <= -0.5:
        risk_level = "medium"
    elif compound <= -0.2:
        risk_level = "low"
    else:
        risk_level = "none"

    emotions = {
        "sadness": round(max(0.0, scores["neg"] - scores["pos"]) * subjectivity, 3),
        "positivity": round(scores["pos"], 3),
        "negativity": round(scores["neg"], 3),
        "neutrality": round(scores["neu"], 3),
    }

    return {
        "sentiment_score": round(compound, 4),
        "risk_level": risk_level,
        "language_detected": lang,
        "emotions": emotions,
        "subjectivity": round(subjectivity, 3),
        "positive": round(scores["pos"], 4),
        "negative": round(scores["neg"], 4),
        "neutral": round(scores["neu"], 4),
    }
