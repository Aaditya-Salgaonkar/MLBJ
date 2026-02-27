"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase"; // Ensure this path matches your setup
import { FaArrowLeft, FaGithub, FaGoogle, FaSignInAlt, FaBalanceScale } from "react-icons/fa";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleOTPLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  const handleOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Themed Background Glow */}
      <div className="absolute -top-20 -left-32 w-60 h-60 bg-[#A03623] opacity-10 blur-[120px] rounded-full z-0" />
      <div className="absolute -bottom-60 -right-10 w-50 h-50 bg-slate-400 opacity-20 blur-[100px] rounded-full z-0" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md border border-slate-100 mx-4"
      >
        <div className="relative z-10 p-8">
          {/* Back Button */}
          <Link
            href="/"
            className="absolute left-4 top-4 p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <FaArrowLeft className="size-5" />
          </Link>

          {/* Icon Header */}
          <div className="flex justify-center mb-6 mt-2">
            <div className="p-4 bg-[#A03623] rounded-xl shadow-lg shadow-[#A03623]/30">
              <FaBalanceScale className="text-2xl text-white" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-2">
            Sign in to{" "}
            <span className="text-[#A03623]">
              Judiciary Portal
            </span>
          </h2>

          <p className="text-center text-slate-500 text-sm font-medium mb-8">
            Welcome back! Please sign in to access case files.
          </p>

          {/* OAuth Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              className="flex-1 py-2.5 border border-slate-200 rounded-lg flex justify-center items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <FaGoogle/> Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Or with email</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Email Field */}
          <div className="space-y-4">
            <input
              placeholder="Email address"
              type="email"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A03623]/20 focus:border-[#A03623] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>
            )}

            {/* Login Button */}
            <Link href="/dashboard">
            <button
              onClick={handleOTPLogin}
              disabled={loading || !email}
              className="w-full py-3 text-sm md:text-base font-bold text-white rounded-lg bg-[#A03623] hover:bg-[#8a2e1e] active:scale-[0.98] transition-all shadow-md shadow-[#A03623]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending Code..." : "Login"}
            </button></Link>
          </div>

          <p className="mt-8 text-xs text-center text-slate-500">
            {"Don't have an account? "}{" "}
            <Link
              href="/auth/signup"
              className="text-[#A03623] font-bold hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}