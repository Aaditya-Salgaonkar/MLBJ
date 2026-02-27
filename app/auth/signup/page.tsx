"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { FaArrowLeft, FaGoogle, FaUserAlt } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    const { email, name, username } = form;

    if (!email || !name || !username) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: { name: name, username: username },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}`
      );
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden font-sans">
      {/* 🌤 Premium Light Gradients */}
      <div className="absolute -top-20 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-[#dc5c45] to-[#A03623] opacity-10 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-60px] -right-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#A03623] to-[#9c2c18] opacity-10 blur-[100px] rounded-full z-0" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl w-full max-w-md z-10 mx-4"
      >
        <div className="relative z-10 p-8 md:p-10">
          <Link
            href="/"
            className="absolute left-6 top-6 p-2 rounded-xl hover:bg-slate-100 active:scale-95 duration-200 transition text-slate-400 hover:text-slate-700"
          >
            <FaArrowLeft className="size-5" />
          </Link>

          <div className="flex justify-center mb-6 mt-2">
            <div className="p-4 bg-gradient-to-br from-[#dc5c45] via-[#A03623] to-[#9c2c18] rounded-2xl shadow-lg shadow-[#A03623]/20">
              <FaUserAlt className="text-2xl text-white" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">
            Create your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#dc5c45] to-[#9c2c18]">
              Account
            </span>
          </h2>

          <p className="text-center text-slate-500 text-sm font-medium mb-8">
            Welcome! Please fill in the details to get started.
          </p>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              className="w-full py-3 border border-slate-200 rounded-xl flex justify-center items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all"
            >
              <FaGoogle className="text-red-500" /> Google
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">or</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <input
                placeholder="Name"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div>
              <input
                placeholder="Username"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>
          </div>

          <input
            placeholder="Email address"
            type="email"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm mb-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-xs font-bold text-red-600 text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="mt-2 w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#dc5c45] via-[#A03623] to-[#9c2c18] hover:shadow-lg hover:shadow-[#A03623]/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </button>

          <p className="mt-8 text-sm font-medium text-center text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#A03623] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}