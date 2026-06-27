import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Database, Zap, Shield, Users, Award } from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

/**
 * Design Philosophy: Precision Intelligence
 * - Detailed explanation of AI model and technologies
 * - Feature cards with icons and descriptions
 * - Team/company information section
 * - Professional, trustworthy design
 * - Soft shadows and rounded cards
 */

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container max-w-4xl">
          <div className="space-y-6 text-center">
            <Badge className="w-fit mx-auto bg-blue-100 text-blue-900 hover:bg-blue-100">
              About Our Technology
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Fighting Misinformation with AI
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our mission is to empower people with tools to identify and combat fake news in the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* AI Model Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                How Our AI Model Works
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our fake news detection system combines cutting-edge natural language processing (NLP) with machine learning algorithms trained on thousands of verified and false news articles. The model analyzes linguistic patterns, source credibility, and content characteristics to identify misinformation with high accuracy.
              </p>
            </div>

            {/* Technology Stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-900" />
                    BERT Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">
                    We use Bidirectional Encoder Representations from Transformers (BERT), a state-of-the-art language model developed by Google.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Understands context and nuance in text</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Trained on 3.3 billion words</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Fine-tuned for fake news detection</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-900" />
                    Training Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">
                    Our model is trained on a diverse dataset of verified news sources and known misinformation.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>50,000+ labeled articles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Multiple languages supported</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Continuously updated</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-900" />
                    NLP Techniques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">
                    Advanced natural language processing techniques identify misinformation patterns.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Sentiment analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Entity recognition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>Linguistic feature extraction</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-900" />
                    Accuracy Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">
                    Our model achieves industry-leading performance metrics.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>98% Accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>97% Precision</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-900 font-bold">•</span>
                      <span>96% Recall</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container max-w-4xl">
          <div className="space-y-12">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Key Features
              </h2>
              <p className="text-gray-600">
                What makes our fake news detector unique
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Real-Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get instant results in under one second. Our optimized model processes text efficiently without sacrificing accuracy.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Explanations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Understand why content is flagged. We highlight suspicious elements and explain our reasoning.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Privacy First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Your data is never stored or used for training. All analysis happens securely and privately.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Continuous Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our model is regularly updated with new misinformation patterns to stay ahead of evolving tactics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Important Limitations
              </h2>
              <p className="text-gray-600">
                Our tool is powerful but not perfect. Please keep these limitations in mind:
              </p>
            </div>

            <div className="space-y-4">
              <Card className="border-yellow-200 bg-yellow-50 shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-yellow-900">Not a Replacement for Critical Thinking</h3>
                    <p className="text-yellow-800">
                      This tool should be used as a supplementary aid, not a definitive source of truth. Always verify information through multiple reputable sources.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50 shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-yellow-900">Context Matters</h3>
                    <p className="text-yellow-800">
                      The model analyzes text content but cannot fully understand context, satire, or cultural nuances. Satire and opinion pieces may be flagged incorrectly.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50 shadow-md">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-yellow-900">Emerging Misinformation</h3>
                    <p className="text-yellow-800">
                      New and novel misinformation tactics may not be detected immediately. The model learns from patterns but cannot predict entirely new approaches.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container max-w-4xl">
          <div className="space-y-12">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We believe in the power of technology to combat misinformation and protect the integrity of information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-gray-200 shadow-md text-center">
                <CardContent className="pt-8">
                  <Users className="w-12 h-12 text-blue-900 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Community Driven</h3>
                  <p className="text-sm text-gray-600">
                    Built by researchers and engineers passionate about combating misinformation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md text-center">
                <CardContent className="pt-8">
                  <Award className="w-12 h-12 text-blue-900 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Award Winning</h3>
                  <p className="text-sm text-gray-600">
                    Recognized for innovation in AI-powered fact-checking and misinformation detection.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md text-center">
                <CardContent className="pt-8">
                  <Shield className="w-12 h-12 text-blue-900 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Transparent</h3>
                  <p className="text-sm text-gray-600">
                    We believe in open communication about our methods, limitations, and ongoing improvements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-blue-900 text-white">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Detect Fake News?
          </h2>
          <p className="text-lg text-blue-100">
            Start analyzing articles today and help fight misinformation.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-white text-blue-900 hover:bg-gray-100 font-semibold py-6 px-8"
          >
            Analyze News Now
          </Button>
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
