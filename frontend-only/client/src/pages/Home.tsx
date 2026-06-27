import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { toast } from "sonner";

/**
 * Design Philosophy: Precision Intelligence
 * - Hero section with asymmetric layout (left title, right visual)
 * - Large, inviting text input area as the hero element
 * - Deep navy blue primary color for trust and intelligence
 * - Soft shadows and rounded cards for premium feel
 * - Poppins font for bold titles, Inter for body text
 */

export default function Home() {
  const [newsText, setNewsText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setLocation] = useLocation();

  const handleAnalyze = async () => {
    if (newsText.trim().length >= 20) {
      setIsAnalyzing(true);
      try {
        const res = await api.post("/predict", { text: newsText });
        sessionStorage.setItem("latest_prediction", JSON.stringify(res.data));
        toast.success("Analysis complete!");
        setLocation("/result");
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Failed to analyze text");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handlePasteUrl = () => {
    // Placeholder for URL paste functionality
    alert("Feature coming soon: Paste a news URL to analyze");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-12 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Title and Description */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="w-fit bg-blue-100 text-blue-900 hover:bg-blue-100">
                  Powered by AI
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Detect Fake News in Seconds
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our advanced AI model analyzes news articles and headlines to identify misinformation with high accuracy. Get instant results with detailed explanations.
                </p>
              </div>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>High Accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Shield className="w-4 h-4 text-blue-900" />
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030096451/Rajyvi25tke77DLpEMjZ3n/hero-ai-pattern-eQkKigMpDxaxRk6WCXabmG.webp"
                alt="AI Pattern"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Input Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container max-w-3xl">
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Analyze News Content
              </h2>
              <p className="text-gray-600">
                Paste your news headline, article text, or URL below to get started
              </p>
            </div>

            {/* Input Card */}
            <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">News Content</CardTitle>
                <CardDescription>
                  Enter the text you want to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Textarea Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste your news headline or article text here... (minimum 20 characters)"
                    value={newsText}
                    onChange={(e) => setNewsText(e.target.value)}
                    className="min-h-48 resize-none border-gray-300 focus:border-blue-900 focus:ring-blue-900 text-gray-900 placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500">
                    {newsText.length} characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={newsText.trim().length < 20 || isAnalyzing}
                    className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-6 text-base font-semibold rounded-lg transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze News
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handlePasteUrl}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-900 py-6 text-base font-semibold hover:bg-gray-50"
                  >
                    Paste URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-900">98%</div>
                    <p className="text-sm text-gray-600">Accuracy Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-emerald-600">10K+</div>
                    <p className="text-sm text-gray-600">Articles Analyzed</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-orange-600">&lt;1s</div>
                    <p className="text-sm text-gray-600">Average Response</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container">
          <div className="text-center space-y-12">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI model uses advanced NLP and machine learning to detect patterns of misinformation
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Paste Content", desc: "Enter your news text or URL" },
                { step: "2", title: "AI Analysis", desc: "Our model analyzes the content" },
                { step: "3", title: "Detection", desc: "Identifies suspicious patterns" },
                { step: "4", title: "Results", desc: "Get detailed explanation" },
              ].map((item) => (
                <div key={item.step} className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-lg mx-auto">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
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
