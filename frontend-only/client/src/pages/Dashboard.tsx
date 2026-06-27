import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  TrendingUp, Award, BarChart2, Globe, HelpCircle, RefreshCw, 
  FileText, CheckCircle, AlertTriangle, AlertCircle, Loader2, LogOut,
  Sparkles, CheckCircle2, Trash2, BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface PredictionItem {
  id: number;
  title: string | null;
  text_snippet: string;
  label: "FAKE" | "REAL";
  confidence: number;
  prob_fake: number;
  prob_real: number;
  model_used: string;
  latency_ms: number;
  created_at: string;
}

interface RecommendationCardType {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action_url?: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [history, setHistory] = useState<PredictionItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationCardType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [historyRes, recsRes] = await Promise.all([
        api.get("/predict/history"),
        api.get("/recommendations")
      ]);
      setHistory(historyRes.data);
      setRecommendations(recsRes.data.cards || []);
    } catch (err: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setLocation("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  // Calculate statistics
  const totalAnalyzed = history.length;
  const fakeCount = history.filter(item => item.label === "FAKE").length;
  const realCount = totalAnalyzed - fakeCount;
  const fakePercentage = totalAnalyzed > 0 ? Math.round((fakeCount / totalAnalyzed) * 100) : 0;
  const realPercentage = totalAnalyzed > 0 ? Math.round((realCount / totalAnalyzed) * 100) : 0;
  const avgConfidence = totalAnalyzed > 0 
    ? Math.round(history.reduce((acc, item) => acc + item.confidence, 0) / totalAnalyzed * 100)
    : 0;

  // Icon mapper for recommendation cards
  const renderCardIcon = (iconName: string, color: string) => {
    const props = { className: `w-6 h-6 text-${color}-600` };
    switch (iconName) {
      case "FileText": return <FileText {...props} />;
      case "CheckCircle": return <CheckCircle {...props} />;
      case "AlertTriangle": return <AlertTriangle {...props} />;
      case "TrendingUp": return <TrendingUp {...props} />;
      case "Award": return <Award {...props} />;
      case "BarChart2": return <BarChart2 {...props} />;
      case "Globe": return <Globe {...props} />;
      case "HelpCircle": return <HelpCircle {...props} />;
      case "RefreshCw": return <RefreshCw {...props} />;
      default: return <BookOpen {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FakeNews AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Hello, {user?.username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your fake news detection stats and personalized recommendation tips</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription>Total Articles</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-950">{totalAnalyzed}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription>Fake News Flagged</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-650">{fakeCount}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-red-500 font-medium">{fakePercentage}% of total</span>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription>Verified Real</CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-650">{realCount}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-emerald-500 font-medium">{realPercentage}% of total</span>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription>Average Confidence</CardDescription>
              <CardTitle className="text-3xl font-bold text-indigo-950">{avgConfidence}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>
            
            {history.length === 0 ? (
              <Card className="border-gray-200 p-8 text-center text-gray-500">
                You haven't analyzed any articles yet. 
                <Button onClick={() => setLocation("/")} className="mt-4 bg-blue-900 hover:bg-blue-800 text-white">
                  Analyze Your First Article
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <Card key={item.id} className="border-gray-200 shadow-xs hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1 flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          {item.label === "FAKE" ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200">FAKE</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">REAL</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.title || "Untitled Analysis"}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {item.text_snippet}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(item.confidence * 100)}%
                        </span>
                        <p className="text-xs text-gray-500">Confidence</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations Side panel */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Personalized Insights</h2>
            
            <div className="space-y-4">
              {recommendations.map((card, idx) => (
                <Card key={idx} className="border-gray-200 shadow-xs">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className={`p-2 rounded-lg bg-${card.color}-50`}>
                      {renderCardIcon(card.icon, card.color)}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">{card.description}</p>
                    {card.action_url && (
                      <a 
                        href={card.action_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-semibold text-blue-900 hover:underline flex items-center gap-1"
                      >
                        Learn more →
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
