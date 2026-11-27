"use client";

import React from "react";
import {
  Bell,
  LayoutDashboard,
  PlusCircle,
  ClipboardCheck,
  Users,
  ShieldCheck,
  LogOut,
  Search,
  FileText,
  Clock,
  Trophy,
  UserCog,
} from "lucide-react";
import { UserAccount } from "@/data/mockData";

export type ActiveTab =
  | "dashboard"
  | "opportunities"
  | "applications"
  | "volunteers"
  | "admins"
  | "volunteer-dashboard"
  | "browse"
  | "my-applications"
  | "hours-history"
  | "badges-leaderboard"
  | "profile";

interface PortalHeaderProps {
  currentUser: UserAccount;
  onLogout: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  notifications: string[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onClearNotifications: () => void;
}

export default function PortalHeader({
  currentUser,
  onLogout,
  activeTab,
  onSelectTab,
  notifications,
  showNotifications,
  onToggleNotifications,
  onClearNotifications,
}: PortalHeaderProps) {
  const isVolunteer =
    currentUser.role === "STUDENT_VOLUNTEER" ||
    currentUser.role === "ALUMNI_VOLUNTEER";

  const portalSubtitle =
    currentUser.role === "SUPER_ADMIN"
      ? "SUPER ADMIN PORTAL"
      : currentUser.role === "ADMIN"
      ? "ADMIN PORTAL"
      : currentUser.role === "STUDENT_VOLUNTEER"
      ? "STUDENT VOLUNTEER PORTAL"
      : "ALUMNI VOLUNTEER PORTAL";

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] =
    isVolunteer
      ? [
          {
            id: "volunteer-dashboard",
            label: "Volunteer Dashboard",
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            id: "browse",
            label: "Opportunity Explorer",
            icon: <Search className="w-4 h-4" />,
          },
          {
            id: "my-applications",
            label: "My Applications",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: "hours-history",
            label: "Hours & History",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            id: "badges-leaderboard",
            label: "Badges & Leaderboard",
            icon: <Trophy className="w-4 h-4" />,
          },
          {
            id: "profile",
            label: "Profile & Settings",
            icon: <UserCog className="w-4 h-4" />,
          },
        ]
      : [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            id: "opportunities",
            label: "Manage Opportunities",
            icon: <PlusCircle className="w-4 h-4" />,
          },
          {
            id: "applications",
            label: "Applications & Applicants",
            icon: <ClipboardCheck className="w-4 h-4" />,
          },
          ...(currentUser.role === "ADMIN"
            ? [
                {
                  id: "volunteers" as ActiveTab,
                  label: "Approve & Manage Volunteers",
                  icon: <Users className="w-4 h-4" />,
                },
              ]
            : []),
          ...(currentUser.role === "SUPER_ADMIN"
            ? [
                {
                  id: "admins" as ActiveTab,
                  label: "Approve & Manage Admins",
                  icon: <ShieldCheck className="w-4 h-4" />,
                },
              ]
            : []),
        ];

  return (
    <header className="bg-[#522A5B] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
            MAATRAM VOLUNTEERHUB
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#F3EAF6]/90 mt-0.5">
            {portalSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-4 relative">
          <button
            type="button"
            onClick={onToggleNotifications}
            className="relative p-2.5 rounded-lg bg-[#7A4286] hover:bg-[#663472] transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-[#1F1624] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold">{currentUser.name}</div>
            <div className="text-xs text-[#F3EAF6]/80">
              {isVolunteer
                ? `${currentUser.points} pts • ${currentUser.verifiedHours} hrs`
                : currentUser.email}
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#7A4286] hover:bg-[#663472] text-xs font-semibold transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-14 w-80 bg-white text-[#1F1624] rounded-xl shadow-xl border border-[#E5D8EC] p-4 z-30">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F3EAF6]">
                <span className="font-semibold text-sm">Notifications</span>
                <button
                  type="button"
                  onClick={onClearNotifications}
                  className="text-xs font-medium text-[#7A4286] hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">
                  No new notifications
                </p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n, idx) => (
                    <li
                      key={idx}
                      className="text-xs bg-[#F3EAF6] text-[#522A5B] p-2.5 rounded-lg"
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="bg-[#7A4286] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap gap-2 py-2.5">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                  active
                    ? "bg-white text-[#522A5B] shadow-sm font-semibold"
                    : "text-white hover:bg-[#522A5B]/60"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}