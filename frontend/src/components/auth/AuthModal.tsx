"use client";

import { useAuth } from "@/lib/auth-context";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}



export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signIn } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    if (isAuthModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeAuthModal();
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[420px] mx-4 animate-modal-in"
      >
        <div className="bg-[#0f1117] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200 z-20"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Sign In Required
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              Please sign in to access all features of RepoWiki AI.
            </p>
          </div>

          {/* Divider */}
          <div className="px-8 py-4">
            <div className="h-px bg-white/[0.06]" />
          </div>

          {/* OAuth Buttons */}
          <div className="px-8 pb-4 space-y-3">
            <button
              onClick={() => signIn("google")}
              className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => signIn("github")}
              className="group w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <GitHubIcon />
              <span>Continue with GitHub</span>
            </button>

          </div>

          {/* Continue Browsing */}
          <div className="px-8 pb-8">
            <button
              onClick={closeAuthModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-white/[0.04] text-slate-300 hover:text-white font-medium text-sm rounded-xl border border-white/[0.1] hover:border-white/[0.2] transition-all duration-200 active:scale-[0.98]"
            >
              Continue Browsing
            </button>
          </div>

          {/* Footer Note */}
          <div className="px-8 pb-6">
            <p className="text-[11px] text-slate-600 text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
