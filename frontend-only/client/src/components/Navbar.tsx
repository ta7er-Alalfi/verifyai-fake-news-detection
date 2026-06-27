import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, User, LayoutDashboard, History, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      setLocation("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setLocation("/")}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">FakeNews AI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setLocation("/")} 
            className={`text-sm font-medium transition-colors ${location === "/" ? "text-blue-900 font-bold" : "text-gray-600 hover:text-gray-900"}`}
          >
            Home
          </button>
          <button 
            onClick={() => setLocation("/about")} 
            className={`text-sm font-medium transition-colors ${location === "/about" ? "text-blue-900 font-bold" : "text-gray-600 hover:text-gray-900"}`}
          >
            About
          </button>
          {user && (
            <>
              <button 
                onClick={() => setLocation("/dashboard")} 
                className={`text-sm font-medium transition-colors ${location === "/dashboard" ? "text-blue-900 font-bold" : "text-gray-600 hover:text-gray-900"}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setLocation("/history")} 
                className={`text-sm font-medium transition-colors ${location === "/history" ? "text-blue-900 font-bold" : "text-gray-600 hover:text-gray-900"}`}
              >
                History
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.username}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="text-red-650 hover:text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/login")}
                className="text-gray-700 hover:text-gray-900"
              >
                Login
              </Button>
              <Button 
                size="sm" 
                onClick={() => setLocation("/register")}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
