import { COLORS, FONTS } from "@/theme/themeConstants";
import Image from "next/image";
import { authService } from "@/services/apiService";

export default function SignInPopup({ onClose }) {
  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-white/30">
      <div
        className="relative bg-background rounded-3xl shadow-card p-8 flex flex-col items-center gap-6 min-w-[400px] border border-gray-200"
        style={{ fontFamily: FONTS.main, backgroundColor: COLORS.background }}
      >
        <button
          className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-primary transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <Image
          src="/assets/icons/logo.jpg"
          alt="Logo"
          width={98}
          height={58}
          className="mb-2"
        />
        <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>
          Welcome Back
        </h2>
        <p className="text-base text-gray-700 text-center mb-4 max-w-sm">
          Sign in to continue your learning journey with Al Reems Academy.
        </p>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full font-semibold text-lg shadow-card transition-colors hover:opacity-90"
          style={{ backgroundColor: COLORS.primary, color: COLORS.background, fontFamily: FONTS.main }}
        >
          <Image src="/assets/icons/google.png" alt="Google" width={24} height={24} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
