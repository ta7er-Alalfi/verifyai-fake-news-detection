import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  /** Label shown on the button (defaults to "Continue with Google") */
  label?: string;
  /** Where to redirect after successful auth (defaults to /dashboard) */
  redirectTo?: string;
  /** Automatically prompt the Google login flow when the button is rendered */
  autoPrompt?: boolean;
  className?: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function GoogleSignInButton({
  label = "Continue with Google",
  redirectTo = "/dashboard",
  autoPrompt = false,
  className = "",
}: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [promptAttempted, setPromptAttempted] = useState(false);

  const startGoogleSignIn = () => {
    if (!window.google) {
      toast.error("Google Sign-In is not available. Please try again later.");
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      toast.error("Google Sign-In is not configured for this environment.");
      return;
    }

    setLoading(true);

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          await googleLogin(response.credential);
          toast.success("Successfully signed in with Google!");
          setLocation(redirectTo);
        } catch (err: any) {
          toast.error(err.response?.data?.detail || "Google Sign-In failed. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      auto_select: true,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setLoading(false);
        toast.error("Google Sign-In popup was blocked or dismissed. Please allow popups for this site.");
      }
    });
  };

  const handleGoogleSignIn = () => {
    startGoogleSignIn();
  };

  useEffect(() => {
    if (!autoPrompt || promptAttempted) {
      return;
    }

    let timer: number | undefined;
    const waitForGoogle = () => {
      if (window.google && window.google.accounts?.id) {
        startGoogleSignIn();
        setPromptAttempted(true);
      } else {
        timer = window.setTimeout(waitForGoogle, 250);
      }
    };

    if (GOOGLE_CLIENT_ID) {
      waitForGoogle();
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [autoPrompt, promptAttempted]);

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`
        w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
        border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300
        text-gray-700 font-semibold text-sm
        transition-all duration-200 ease-in-out
        shadow-sm hover:shadow-md
        disabled:opacity-60 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Signing in with Google...</span>
        </>
      ) : (
        <>
          {/* Official Google "G" logo SVG */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
