"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar"; // Adjust path as needed

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  // Mock Data
  const [profile, setProfile] = useState({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@judiciary.gov",
    role: "Chief Magistrate",
    phone: "+1 (555) 123-4567",
  });

  const [notifications, setNotifications] = useState({
    caseUpdates: true,
  });

  const tabs = ["Profile", "Notifications", "Security", "Preferences"];

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
                  <button className="px-6 py-3 bg-gradient-to-r from-[#dc5c45] via-[#A03623] to-[#9c2c18] text-white text-sm font-bold rounded-xl shadow-md shadow-[#dc5c45]/20 hover:shadow-lg transition-all">
                    Save Changes
                  </button>
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
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#dc5c45]/20 focus:border-[#dc5c45] transition-all"
                    />
                  </div>
                </div>
               
              </div>
            )}

            {activeTab === "Notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Receive notifications regarding {key.replace(/([A-Z])/g, ' $1').toLowerCase()}.
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          value ? "bg-[#dc5c45]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            value ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === "Security" || activeTab === "Preferences") && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Module Under Construction</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  The {activeTab} settings module is currently being updated. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}