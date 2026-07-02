import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { toast } from "sonner";

interface AnalyzedArticle {
  id: number;
  title: string | null;
  text_snippet: string;
  label: "REAL" | "FAKE";
  confidence: number;
  created_at: string;
}

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [articles, setArticles] = useState<AnalyzedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/predict/history");
      setArticles(res.data);
    } catch (err: any) {
      console.error("History load failed", err);
      toast.error(err.response?.data?.detail || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    // Note: If backend does not support deleting individual history items,
    // we can filter it out locally.
    setArticles(articles.filter((article) => article.id !== id));
    toast.success("Item removed from view");
  };

  const handleViewResult = (article: AnalyzedArticle) => {
    const predictionResult = {
      label: article.label,
      confidence: article.confidence,
      explanation: article.label === "FAKE" 
        ? "This article exhibits several characteristics common to misinformation, saved from history."
        : "This article exhibits characteristics common to authentic reporting, saved from history."
    };
    sessionStorage.setItem("latest_prediction", JSON.stringify(predictionResult));
    setLocation("/result");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  const fakeCount = articles.filter((a) => a.label === "FAKE").length;
  const realCount = articles.filter((a) => a.label === "REAL").length;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Analysis History
              </h1>
              <p className="text-gray-600">
                View all your previously analyzed articles and their predictions
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-gray-200 shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Total Analyzed</p>
                    <div className="text-3xl font-bold text-gray-900">{articles.length}</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50 shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-700">Real News</p>
                      <div className="text-3xl font-bold text-emerald-600">{realCount}</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50 shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700">Fake News</p>
                      <div className="text-3xl font-bold text-red-600">{fakeCount}</div>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Articles List */}
            {articles.length > 0 ? (
              <div className="space-y-3">
                {articles.map((article) => (
                  <Card
                    key={article.id}
                    className="border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewResult(article)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Left Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start gap-3">
                            <Badge
                              className={`flex-shrink-0 ${
                                article.label === "FAKE"
                                  ? "bg-red-100 text-red-900 hover:bg-red-100"
                                  : "bg-emerald-100 text-emerald-900 hover:bg-emerald-100"
                              }`}
                            >
                              {article.label}
                            </Badge>
                            <h3 className="text-lg font-semibold text-gray-900 break-words">
                              {article.title || "Untitled Analysis"}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {article.text_snippet}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(article.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        {/* Right Content */}
                        <div className="flex items-center gap-4 md:flex-col md:items-end">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Confidence</p>
                            <div
                              className={`text-2xl font-bold ${
                                article.label === "FAKE"
                                  ? "text-red-650"
                                  : "text-emerald-650"
                              }`}
                            >
                              {Math.round(article.confidence * 100)}%
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(article.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-655 transition-colors hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-gray-200 shadow-md">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="space-y-3">
                    <p className="text-gray-600">No articles analyzed yet</p>
                    <Button
                      onClick={() => setLocation("/")}
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                    >
                      Analyze Your First Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clear History Button */}
            {articles.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setArticles([])}
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  Clear All History
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

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
