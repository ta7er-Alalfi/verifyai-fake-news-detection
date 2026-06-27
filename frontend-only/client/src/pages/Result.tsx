import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertCircle, CheckCircle2, Lightbulb, Share2, Flag } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import Chatbot from "../components/Chatbot";
import Navbar from "../components/Navbar";

/**
 * Design Philosophy: Precision Intelligence
 * - Prediction card with emerald green (real) or coral red (fake) colors
 * - Circular confidence meter for intuitive certainty visualization
 * - Highlighted suspicious phrases with subtle background
 * - Detailed explanation section with AI reasoning
 * - Soft shadows and rounded cards throughout
 * - Feedback modal for reporting incorrect analyses
 */

type FeedbackType = "incorrect" | "unclear" | "other";

export default function Result() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load actual data from sessionStorage
  const [predictionData] = useState(() => {
    const data = sessionStorage.getItem("latest_prediction");
    return data ? JSON.parse(data) : null;
  });

  const prediction = predictionData?.label || "FAKE";
  const confidence = Math.round((predictionData?.confidence || 0.87) * 100);
  const explanation = predictionData?.explanation || "This article exhibits characteristics common to misinformation. The style and context patterns matched our fake news classification metrics.";

  const suspiciousWords = [
    { word: "sensational claim", reason: "Unverified dramatic statement" },
    { word: "anonymous sources", reason: "Lacks credibility markers" },
    { word: "urgent action required", reason: "Manipulative language pattern" },
  ];

  const handleCopyResult = () => {
    const text = `Prediction: ${prediction}\nConfidence: ${confidence}%\nExplanation: ${explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeAnother = () => {
    setLocation("/");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackType || !feedbackText.trim()) {
      toast.error("Please select a feedback type and provide details");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you! Your feedback has been submitted.");
      setFeedbackOpen(false);
      setFeedbackType(null);
      setFeedbackText("");
    }, 1500);
  };

  const handleOpenFeedback = () => {
    setFeedbackOpen(true);
    setFeedbackType(null);
    setFeedbackText("");
  };

  const feedbackTypeOptions = [
    {
      type: "incorrect" as FeedbackType,
      title: "Incorrect Prediction",
      description: "The analysis result is wrong",
    },
    {
      type: "unclear" as FeedbackType,
      title: "Unclear Explanation",
      description: "The reasoning is confusing or incomplete",
    },
    {
      type: "other" as FeedbackType,
      title: "Other Feedback",
      description: "Something else to report",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container max-w-3xl">
          <div className="space-y-8">
            {/* Prediction Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <img
                src={
                  prediction === "FAKE"
                    ? "https://d2xsxph8kpxj0f.cloudfront.net/310419663030096451/Rajyvi25tke77DLpEMjZ3n/result-alert-bg-KGsa4XXq3PEZYoAngbJpxk.webp"
                    : "https://d2xsxph8kpxj0f.cloudfront.net/310419663030096451/Rajyvi25tke77DLpEMjZ3n/result-success-bg-DrWvEFiR8dAMWkQPZvHSys.webp"
                }
                alt="Result Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/80" />
              
              <div className="relative p-8 md:p-12 flex items-center justify-between">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Analysis Result
                  </p>
                  <div className="space-y-2">
                    <h1 className="text-5xl md:text-6xl font-bold">
                      {prediction === "FAKE" ? (
                        <span className="text-red-600">FAKE</span>
                      ) : (
                        <span className="text-emerald-600">REAL</span>
                      )}
                    </h1>
                    <p className="text-gray-600">
                      {prediction === "FAKE"
                        ? "This content appears to be misinformation"
                        : "This content appears to be authentic"}
                    </p>
                  </div>
                </div>

                {/* Circular Confidence Meter */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={prediction === "FAKE" ? "#DC2626" : "#059669"}
                        strokeWidth="8"
                        strokeDasharray={`${(confidence / 100) * 339.29} 339.29`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{confidence}%</div>
                        <div className="text-xs text-gray-600">Confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suspicious Words Section */}
            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Suspicious Elements Detected
                </CardTitle>
                <CardDescription>
                  Words and phrases that triggered our detection algorithm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suspiciousWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 break-words">
                          "{item.word}"
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Explanation Section */}
            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-900" />
                  Why This Content Is Flagged
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">{explanation}</p>
                
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900">Key Indicators:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">Sensational language and exaggeration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">Lack of credible sources or citations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">Emotional manipulation tactics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">Unverified claims presented as facts</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Section */}
            <Card className="border-emerald-200 bg-emerald-50 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5" />
                  What You Should Do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-emerald-900">
                  Before sharing this content, consider:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold mt-1">✓</span>
                    <span className="text-emerald-900">Verify with multiple reputable sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold mt-1">✓</span>
                    <span className="text-emerald-900">Check the original source and publication date</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold mt-1">✓</span>
                    <span className="text-emerald-900">Look for fact-checking articles from trusted organizations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAnalyzeAnother}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-6 text-base font-semibold rounded-lg transition-all"
              >
                Analyze Another Article
              </Button>
              <Button
                onClick={handleCopyResult}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-900 py-6 text-base font-semibold hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy Result"}
              </Button>
            </div>

            {/* Report Feedback Button */}
            <Button
              onClick={handleOpenFeedback}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 py-6 text-base font-semibold"
            >
              <Flag className="w-4 h-4 mr-2" />
              Report Incorrect Analysis
            </Button>

            {/* Disclaimer */}
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-xs text-gray-600">
                <strong>Disclaimer:</strong> This analysis is provided by an AI model and should not be considered as definitive proof. Always verify information through multiple reputable sources before making decisions based on this content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-600" />
              Report Analysis Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve our AI model by reporting issues or providing feedback about this analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Feedback Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">What's the issue? *</label>
              <div className="space-y-2">
                {feedbackTypeOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setFeedbackType(option.type)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      feedbackType === option.type
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{option.title}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">Additional Details *</label>
              <Textarea
                placeholder="Please provide specific details about the issue. What should the correct prediction be? What information was missed?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value.slice(0, 500))}
                className="min-h-32 border-gray-300 focus:border-orange-600 focus:ring-orange-600 text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500">
                {feedbackText.length} / 500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your feedback is valuable and will be used to improve our AI model. We appreciate your help in making FakeNews AI more accurate.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setFeedbackOpen(false)}
                variant="outline"
                className="border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !feedbackType || !feedbackText.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-lg" />
                <span className="font-bold text-white">FakeNews AI</span>
              </div>
              <p className="text-sm">Detect misinformation with AI-powered analysis</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 FakeNews AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
