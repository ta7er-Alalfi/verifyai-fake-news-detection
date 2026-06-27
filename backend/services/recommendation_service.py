from datetime import datetime
from typing import List
from models.prediction import PredictionHistory
from schemas.recommendation import RecommendationCard, RecommendationsResponse

class RecommendationService:
    @staticmethod
    def generate_recommendations(predictions: List[PredictionHistory]) -> RecommendationsResponse:
        cards = []
        
        # Default educational cards if no predictions exist
        if not predictions:
            cards.append(
                RecommendationCard(
                    type="educational",
                    title="Spotting Clickbait Headlines",
                    description="Clickbait often uses exaggerations ('You won't believe...', 'Shocking!'). Always verify if the content matches the sensational title.",
                    icon="FileText",
                    color="blue",
                    action_url="https://www.commonsensemedia.org/news-and-media-literacy"
                )
            )
            cards.append(
                RecommendationCard(
                    type="tip",
                    title="Cross-Reference with Fact Checkers",
                    description="If a story sounds too good to be true, check Snopes, FactCheck.org, or Reuters Fact Check to see if it's already been verified.",
                    icon="CheckCircle",
                    color="green",
                    action_url="https://www.snopes.com/"
                )
            )
            cards.append(
                RecommendationCard(
                    type="tip",
                    title="Analyze Emotional Bias",
                    description="Misinformation is designed to trigger strong emotions (anger, fear, excitement). If an article makes you emotional, verify before sharing.",
                    icon="AlertTriangle",
                    color="amber",
                    action_url="https://www.factcheck.org/"
                )
            )
            return RecommendationsResponse(cards=cards, generated_at=datetime.utcnow())

        # If user has predictions, calculate some stats
        total = len(predictions)
        fake_count = sum(1 for p in predictions if p.label == "FAKE")
        real_count = total - fake_count
        fake_ratio = fake_count / total if total > 0 else 0

        # Card 1: Analysis Insight
        if total >= 3:
            percentage = int(fake_ratio * 100)
            if percentage > 50:
                cards.append(
                    RecommendationCard(
                        type="insight",
                        title="High Exposure to Misinformation",
                        description=f"Out of your last {total} analyses, {percentage}% were flagged as FAKE. Be extra cautious about news from these sources.",
                        icon="TrendingUp",
                        color="red"
                    )
                )
            else:
                cards.append(
                    RecommendationCard(
                        type="insight",
                        title="Critical Consumption Score",
                        description=f"Great job! {real_count} of your last {total} analyzed articles were verified as REAL. Keep reading critically.",
                        icon="Award",
                        color="green"
                    )
                )
        else:
            cards.append(
                RecommendationCard(
                    type="insight",
                    title="Start Building History",
                    description=f"You've analyzed {total} article{'s' if total > 1 else ''}. Run more articles in the Analyze tab to get deeper history-based insights.",
                    icon="BarChart2",
                    color="blue"
                )
            )

        # Card 2: Source Verification Tip
        cards.append(
            RecommendationCard(
                type="tip",
                title="Identify Domain Names",
                description="Check the domain of your analyzed articles. Fake sites often mimic mainstream sites (e.g., using .co or .com.co instead of .com).",
                icon="Globe",
                color="indigo",
                action_url="https://www.fcc.gov/consumers/guides/how-identify-fake-news"
            )
        )

        # Card 3: Specific Model Feedback
        # Find prediction with lowest confidence to help them understand model uncertainty
        lowest_conf_pred = min(predictions, key=lambda p: p.confidence)
        if lowest_conf_pred.confidence < 0.70:
            title_trunc = (lowest_conf_pred.title[:30] + "...") if lowest_conf_pred.title else "Recent text"
            cards.append(
                RecommendationCard(
                    type="trend",
                    title="Understanding Low Confidence",
                    description=f"Your prediction for '{title_trunc}' had low confidence ({lowest_conf_pred.confidence*100:.1f}%). This happens with mixed reporting or neutral language.",
                    icon="HelpCircle",
                    color="amber"
                )
            )
        else:
            # Fallback to general clickbait warning
            cards.append(
                RecommendationCard(
                    type="trend",
                    title="Detecting Circular Reporting",
                    description="Circular reporting happens when publication A publishes misinformation, publication B reprints it, and A cites B as source. Always find the original study/source.",
                    icon="RefreshCw",
                    color="teal"
                )
            )

        return RecommendationsResponse(cards=cards, generated_at=datetime.utcnow())
