"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  // Initialized with mock user data as a fallback
  const [user, setUser] = useState<any>({ name: "Jane Doe", email: "jane.doe@judiciary.gov" });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (data) setUser(data);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // window.location.href = "/login"; // Uncomment to redirect after signout
  };

  return (
    <div className="w-72 bg-[#f8fafc] text-slate-900 p-8 flex flex-col justify-between h-screen border-r border-slate-200 shadow-2xl shadow-slate-200/50">
      <div>
        <div className="mb-12 ml-8">
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#dc5c45] via-[#A03623] to-[#9c2c18]">
            ML Based
          </h1>
          <h2 className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase mt-2">
            Judiciary System
          </h2>
        </div>

        <div className="space-y-2">
          <SidebarItem
            href="/dashboard"
            label="Dashboard"
            active={pathname.startsWith("/dashboard")}
          />
          <SidebarItem
            href="/search"
            label="Search"
            active={pathname.startsWith("/search")}
          />
          <SidebarItem
            href="/history"
            label="History"
            active={pathname.startsWith("/history")}
          />
          <SidebarItem
            href="/settings"
            label="Settings"
            active={pathname.startsWith("/settings")}
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6 flex flex-col gap-3">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-tr from-[#dc5c45] via-[#A03623] to-[#9c2c18] rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-slate-800 truncate">
              {user?.name || "Loading..."}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || "..."}
            </p>
          </div>
        </div>
        
        <Link href='/'>
        <button 
          onClick={handleSignOut}
          
          className="w-full py-2.5 px-4 bg-slate-200/50 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-bold rounded-xl transition-all duration-300 border border-transparent hover:border-red-100"
        >
          Sign Out
        </button></Link>
      </div>
    </div>
  );
}

export const SidebarItem = ({
  label,
  active = false,
  href
}: {
  label: string;
  active?: boolean;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className={`block px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-[#dc5c45] via-[#A03623] to-[#9c2c18] text-white border border-indigo-100 shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
      }`}
    >
      {label}
    </Link>
  );
};