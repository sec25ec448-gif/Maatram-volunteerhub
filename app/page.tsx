"use client";

import React, { useState } from "react";
import {
  Shield,
  Mail,
  ShieldAlert,
  KeyRound,
  ArrowLeft,
  UserPlus,
  Phone,
  User,
} from "lucide-react";
import PortalHeader, { ActiveTab } from "@/components/PortalHeader";
import DashboardOverview from "@/components/DashboardOverview";
import OpportunitiesManager from "@/components/OpportunitiesManager";
import ApplicationsTable from "@/components/ApplicationsTable";
import UserApprovalsTable from "@/components/UserApprovalsTable";
import {
  INITIAL_USERS,
  INITIAL_OPPORTUNITIES,
  INITIAL_APPLICATIONS,
  UserAccount,
  Opportunity,
  VolunteerApplication,
  UserRole,
} from "@/data/mockData";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  VOLUNTEER: {
    email: "karthik@student.edu",
    password: "Volunteer@123",
  },
  ADMIN: {
    email: "admin@maatram.org",
    password: "Admin@123",
  },
  SUPER_ADMIN: {
    email: "superadmin@maatram.org",
    password: "Super@123",
  },
};

export default function MaatramVolunteerHubPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [applications, setApplications] =
    useState<VolunteerApplication[]>(INITIAL_APPLICATIONS);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "register" | "forgot">(
    "signin"
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>("VOLUNTEER");
  const [isDemoPrefilled, setIsDemoPrefilled] = useState<boolean>(true);

  const [emailInput, setEmailInput] = useState(
    DEMO_CREDENTIALS.VOLUNTEER.email
  );
  const [passwordInput, setPasswordInput] = useState(
    DEMO_CREDENTIALS.VOLUNTEER.password
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [notifications, setNotifications] = useState<string[]>([
    "New volunteer registration request: Anitha Ramesh",
    "New admin account pending approval: newadmin@maatram.org",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  const pushNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev]);
  };

  const handleSelectLoginRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmailInput(DEMO_CREDENTIALS[role].email);
    setPasswordInput(DEMO_CREDENTIALS[role].password);
    setIsDemoPrefilled(true);
    setAuthError(null);
    setAuthSuccess(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const normalizedEmail = emailInput.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!matchedUser || matchedUser.password !== passwordInput) {
      setAuthError("Invalid email or password.");
      return;
    }

    if (matchedUser.role !== selectedRole) {
      setAuthError(
        `This account belongs to ${matchedUser.role.replace(
          "_",
          " "
        )}. Please select the matching portal role above.`
      );
      return;
    }

    if (matchedUser.status === "PENDING_APPROVAL") {
      setAuthError(
        "Your account is pending approval by an administrator. Please check back once approved."
      );
      return;
    }

    if (matchedUser.status === "REJECTED") {
      setAuthError("Your account registration was declined.");
      return;
    }

    setCurrentUserId(matchedUser.id);
    setPhoneInput(matchedUser.phone);
    setActiveTab(matchedUser.role === "VOLUNTEER" ? "browse" : "dashboard");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const normalizedEmail = regEmail.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      setAuthError("An account with this email already exists.");
      return;
    }

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      name: regName.trim(),
      email: normalizedEmail,
      password: regPassword,
      phone: regPhone.trim(),
      role: selectedRole === "SUPER_ADMIN" ? "ADMIN" : selectedRole,
      status: "PENDING_APPROVAL",
    };

    setUsers((prev) => [...prev, newUser]);
    pushNotification(
      `New ${newUser.role.toLowerCase()} registration request: ${newUser.name}`
    );
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPassword("");
    setAuthMode("signin");
    setAuthSuccess(
      "Registration submitted! Your account is pending approval before you can sign in."
    );
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const normalizedEmail = resetEmail.trim().toLowerCase();
    const exists = users.some(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (!exists) {
      setAuthError("No account found with that email address.");
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === normalizedEmail
          ? { ...u, password: newPassword }
          : u
      )
    );
    setEmailInput(normalizedEmail);
    setPasswordInput(newPassword);
    setIsDemoPrefilled(false);
    setResetEmail("");
    setNewPassword("");
    setAuthMode("signin");
    setAuthSuccess("Password updated. You can now sign in with your new password.");
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setShowNotifications(false);
    setAuthError(null);
    setAuthSuccess(null);
    setAuthMode("signin");
    setEmailInput(DEMO_CREDENTIALS[selectedRole].email);
    setPasswordInput(DEMO_CREDENTIALS[selectedRole].password);
    setIsDemoPrefilled(true);
  };

  if (!currentUser) {
    const roleLabelMap: Record<UserRole, string> = {
      VOLUNTEER: "VOLUNTEER",
      ADMIN: "ADMIN",
      SUPER_ADMIN: "SUPER ADMIN",
    };

    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E5D8EC] overflow-hidden">
          {/* Top Violet Banner */}
          <div className="bg-[#5A2961] text-white px-6 py-7 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 mx-auto flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-wide uppercase">
              MAATRAM VOLUNTEERHUB
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#F3EAF6]/90 mt-1.5 leading-relaxed">
              &ldquo;EVERY CONTRIBUTION COUNTS. EVERY VOLUNTEER MATTERS.&rdquo;
            </p>
          </div>

          {/* Sign In / Register Tabs */}
          {authMode !== "forgot" && (
            <div className="grid grid-cols-2 border-b border-[#E5D8EC] bg-[#FAF8FB]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-3.5 text-sm font-semibold transition cursor-pointer border-b-2 ${
                  authMode === "signin"
                    ? "bg-white text-[#5A2961] border-[#6F3577]"
                    : "text-gray-500 border-transparent hover:text-[#5A2961]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-3.5 text-sm font-semibold transition cursor-pointer border-b-2 ${
                  authMode === "register"
                    ? "bg-white text-[#5A2961] border-[#6F3577]"
                    : "text-gray-500 border-transparent hover:text-[#5A2961]"
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Role Selector */}
          {authMode !== "forgot" && (
            <div className="px-6 pt-5 pb-4 bg-[#FAF8FB] border-b border-[#EFE8F3]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                SELECT PORTAL ROLE
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["VOLUNTEER", "ADMIN", "SUPER_ADMIN"] as UserRole[]).map(
                  (role) => {
                    const active = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectLoginRole(role)}
                        className={`py-2 px-2 rounded-full text-xs font-bold uppercase tracking-wide transition cursor-pointer border ${
                          active
                            ? "bg-[#F3EAF6] text-[#5A2961] border-[#6F3577] shadow-2xs"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#C8B2D0]"
                        }`}
                      >
                        {roleLabelMap[role]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Sign In Form */}
          {authMode === "signin" && (
            <form onSubmit={handleSignIn} className="p-6 space-y-4">
              {authError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {authSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setIsDemoPrefilled(false);
                    }}
                    placeholder="you@maatram.org"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAF9FB] text-sm text-[#1F1624] focus:outline-none focus:border-[#6F3577] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setIsDemoPrefilled(false);
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAF9FB] text-sm text-[#1F1624] focus:outline-none focus:border-[#6F3577] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-gray-500">
                  {isDemoPrefilled ? "Demo email pre-filled" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot");
                    setResetEmail(emailInput);
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="font-semibold text-[#6F3577] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#6F3577] hover:bg-[#5A2961] text-white text-sm font-bold transition cursor-pointer shadow-sm"
              >
                Sign In as {roleLabelMap[selectedRole]}
              </button>
            </form>
          )}

          {/* Register Form */}
          {authMode === "register" && (
            <form onSubmit={handleRegister} className="p-6 space-y-3.5">
              {authError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#6F3577] hover:bg-[#5A2961] text-white text-sm font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  Register as{" "}
                  {selectedRole === "SUPER_ADMIN"
                    ? "ADMIN"
                    : roleLabelMap[selectedRole]}
                </span>
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {authMode === "forgot" && (
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#6F3577] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <div>
                <h2 className="text-base font-bold text-[#1F1624]">
                  Reset Password
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter your account email and choose a new password.
                </p>
              </div>

              {authError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#6F3577] hover:bg-[#5A2961] text-white text-sm font-bold transition cursor-pointer"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const isAdminOrSuperAdmin =
    currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  const volunteers = users.filter((u) => u.role === "VOLUNTEER");
  const admins = users.filter((u) => u.role === "ADMIN");
  const pendingCount = users.filter(
    (u) => u.status === "PENDING_APPROVAL"
  ).length;

  const handleUserApproval = (
    userId: string,
    nextStatus: "APPROVED" | "REJECTED",
    roleLabel: UserRole
  ) => {
    if (!isAdminOrSuperAdmin) return;
    if (roleLabel === "ADMIN" && !isSuperAdmin) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    const target = users.find((u) => u.id === userId);
    if (target) {
      pushNotification(
        `${roleLabel === "ADMIN" ? "Admin" : "Volunteer"} ${target.name} marked as ${nextStatus}`
      );
    }
  };

  const handleApplicationDecision = (
    appId: string,
    decision: "APPROVED" | "DECLINED"
  ) => {
    if (!isAdminOrSuperAdmin) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: decision } : a))
    );
    const appItem = applications.find((a) => a.id === appId);
    if (appItem) {
      if (decision === "APPROVED") {
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === appItem.opportunityId
              ? { ...o, filledSlots: Math.min(o.totalSlots, o.filledSlots + 1) }
              : o
          )
        );
      }
      pushNotification(
        `Application from ${appItem.volunteerName} ${decision.toLowerCase()} for ${appItem.opportunityTitle}`
      );
    }
  };

  const handleCreateOpportunity = (
    newOppData: Omit<Opportunity, "id" | "filledSlots">
  ) => {
    if (!isAdminOrSuperAdmin) return;

    const created: Opportunity = {
      ...newOppData,
      id: `opp-${Date.now()}`,
      filledSlots: 0,
    };
    setOpportunities((prev) => [created, ...prev]);
    pushNotification(`Created opportunity: ${created.title}`);
  };

  const handleVolunteerApply = (opp: Opportunity) => {
    const alreadyApplied = applications.some(
      (a) =>
        a.opportunityId === opp.id && a.volunteerEmail === currentUser.email
    );
    if (alreadyApplied || opp.filledSlots >= opp.totalSlots) return;

    const newApp: VolunteerApplication = {
      id: `app-${Date.now()}`,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      volunteerName: currentUser.name,
      volunteerEmail: currentUser.email,
      status: "PENDING",
    };
    setApplications((prev) => [newApp, ...prev]);
    pushNotification(`${currentUser.name} applied for ${opp.title}`);
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, phone: phoneInput } : u
      )
    );
    pushNotification(`Updated phone number for ${currentUser.name}`);
  };

  const myApplications = applications.filter(
    (a) => a.volunteerEmail === currentUser.email
  );

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1F1624]">
      <PortalHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications((s) => !s)}
        onClearNotifications={() => setNotifications([])}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isAdminOrSuperAdmin && activeTab === "dashboard" && (
          <DashboardOverview
            opportunities={opportunities}
            volunteersCount={volunteers.length}
            pendingApprovalsCount={pendingCount}
          />
        )}

        {isAdminOrSuperAdmin && activeTab === "opportunities" && (
          <OpportunitiesManager
            opportunities={opportunities}
            onCreateOpportunity={handleCreateOpportunity}
          />
        )}

        {isAdminOrSuperAdmin && activeTab === "applications" && (
          <ApplicationsTable
            applications={applications}
            onDecision={handleApplicationDecision}
          />
        )}

        {isAdminOrSuperAdmin && activeTab === "volunteers" && (
          <UserApprovalsTable
            title="Volunteer Registration Requests"
            nameHeader="Name"
            approveLabel="Approve"
            roleType="VOLUNTEER"
            users={volunteers}
            onApproveUser={handleUserApproval}
          />
        )}

        {isSuperAdmin && activeTab === "admins" && (
          <UserApprovalsTable
            title="Admin Account Approvals"
            nameHeader="Admin Name"
            approveLabel="Approve Admin"
            roleType="ADMIN"
            users={admins}
            onApproveUser={handleUserApproval}
          />
        )}

        {currentUser.role === "VOLUNTEER" && activeTab === "browse" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#522A5B]">
                Available Volunteer Opportunities
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Browse active Maatram initiatives and reserve your slot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp) => {
                const existingApp = myApplications.find(
                  (a) => a.opportunityId === opp.id
                );
                const remaining = opp.totalSlots - opp.filledSlots;

                return (
                  <div
                    key={opp.id}
                    className="bg-white rounded-xl border border-[#E5D8EC] p-6 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-[#F3EAF6] text-[#522A5B]">
                          {opp.category}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {opp.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#1F1624] mt-3">
                        {opp.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Location: {opp.location}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#F3EAF6] flex items-center justify-between">
                      <div className="text-xs font-semibold text-[#522A5B]">
                        {remaining} of {opp.totalSlots} slots open
                      </div>

                      {existingApp ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F3EAF6] text-[#522A5B]">
                          Status: {existingApp.status}
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={remaining <= 0}
                          onClick={() => handleVolunteerApply(opp)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#7A4286] text-white hover:bg-[#522A5B] disabled:opacity-50 transition cursor-pointer"
                        >
                          {remaining > 0 ? "Apply Now" : "Slots Full"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentUser.role === "VOLUNTEER" && activeTab === "my-applications" && (
          <div className="bg-white rounded-xl border border-[#E5D8EC] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#522A5B] mb-4">
              My Volunteer Applications
            </h2>
            {myApplications.length === 0 ? (
              <p className="text-sm text-gray-500">
                You have not applied to any opportunities yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5D8EC] text-xs uppercase text-[#522A5B]">
                      <th className="py-3 px-4">Opportunity</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-[#F3EAF6] text-sm"
                      >
                        <td className="py-3 px-4 font-medium">
                          {app.opportunityTitle}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3EAF6] text-[#522A5B]">
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentUser.role === "VOLUNTEER" && activeTab === "profile" && (
          <div className="max-w-lg bg-white rounded-xl border border-[#E5D8EC] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#522A5B] mb-1">
              Volunteer Profile & Contact
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Update your contact phone number for event coordination.
            </p>
            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#7A4286]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#7A4286] text-white hover:bg-[#522A5B] transition cursor-pointer"
              >
                Save Phone Number
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}