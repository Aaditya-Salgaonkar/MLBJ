"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    phone: "",
  });

  const [notifications, setNotifications] = useState({
    caseUpdates: true,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (data && !error) {
        setProfile({
          firstName: data.name?.split(" ")[0] || "",
          lastName: data.name?.split(" ").slice(1).join(" ") || "",
          email: data.email || "",
          role: data.role || "Chief Magistrate",
          phone: data.phone || "",
        });
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();

    const { error } = await supabase
      .from("users")
      .update({
        name: fullName,
        email: profile.email,
        phone: profile.phone,
      })
      .eq("id", authData.user.id);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
    }
  };

  const tabs = ["Profile"];



  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-10">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your account configurations and system preferences.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-slate-200 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "text-[#dc5c45] border-b-2 border-[#dc5c45]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            {activeTab === "Profile" && (
              <div className="space-y-3">
                
                 <div className="flex flex-row gap-5 justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Personal Information
                </h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}