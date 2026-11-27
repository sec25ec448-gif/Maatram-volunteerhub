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
  Award,
  Trophy,
  Clock,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Briefcase,
  Calendar,
  Building2,
  Download,
  Upload,
  FileSpreadsheet,
  Users,
  BarChart3,
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
  INITIAL_ACTIVITY_HISTORY,
  INITIAL_IDEAS,
  UserAccount,
  Opportunity,
  VolunteerApplication,
  VolunteerActivityRecord,
  VolunteerIdea,
  UserRole,
} from "@/data/mockData";

interface AppNotification {
  id: string;
  message: string;
  forRoles: UserRole[];
  recipientEmail?: string;
}

interface CollegeStat {
  college: string;
  studentCount: number;
  totalVolunteers: number;
  approvedVolunteers: number;
  totalPoints: number;
  totalHours: number;
  completedActivities: number;
  avgPointsPerVolunteer: number;
}

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  STUDENT_VOLUNTEER: {
    email: "karthik@student.edu",
    password: "Volunteer@123",
  },
  ALUMNI_VOLUNTEER: {
    email: "priya@alumni.com",
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

function isVolunteerRole(role: UserRole) {
  return role === "STUDENT_VOLUNTEER" || role === "ALUMNI_VOLUNTEER";
}

function getVolunteerBadges(user: UserAccount) {
  return [
    {
      id: "beginner",
      title: "Beginner Volunteer",
      requirement: "Complete 1 activity",
      unlocked: user.completedActivities >= 1,
      badgeText: "🌱",
    },
    {
      id: "bronze",
      title: "Bronze Volunteer",
      requirement: "Earn 100 points",
      unlocked: user.points >= 100,
      badgeText: "🥉",
    },
    {
      id: "silver",
      title: "Silver Volunteer",
      requirement: "Earn 300 points",
      unlocked: user.points >= 300,
      badgeText: "🥈",
    },
    {
      id: "gold",
      title: "Gold Volunteer",
      requirement: "Earn 500 points",
      unlocked: user.points >= 500,
      badgeText: "🥇",
    },
    {
      id: "champion",
      title: "Community Champion",
      requirement: "Complete 10 activities",
      unlocked: user.completedActivities >= 10,
      badgeText: "👑",
    },
    {
      id: "consistency",
      title: "Consistency Star",
      requirement: "Participate in 4 consecutive weeks",
      unlocked: (user.consecutiveWeeks ?? 0) >= 4,
      badgeText: "⭐",
    },
  ];
}

function escapeCsvField(value: string | number) {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export default function MaatramVolunteerHubPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [applications, setApplications] =
    useState<VolunteerApplication[]>(INITIAL_APPLICATIONS);
  const [activityHistory, setActivityHistory] = useState<
    VolunteerActivityRecord[]
  >(INITIAL_ACTIVITY_HISTORY);
  const [ideas, setIdeas] = useState<VolunteerIdea[]>(INITIAL_IDEAS);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "register" | "forgot">(
    "signin"
  );
  const [selectedRole, setSelectedRole] =
    useState<UserRole>("STUDENT_VOLUNTEER");
  const [isDemoPrefilled, setIsDemoPrefilled] = useState<boolean>(true);

  const [emailInput, setEmailInput] = useState(
    DEMO_CREDENTIALS.STUDENT_VOLUNTEER.email
  );
  const [passwordInput, setPasswordInput] = useState(
    DEMO_CREDENTIALS.STUDENT_VOLUNTEER.password
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCollege, setRegCollege] = useState("");
  const [regDesignation, setRegDesignation] = useState("");
  const [regYearOfPassedOut, setRegYearOfPassedOut] = useState("");

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Event-wide equal points & individual extra points state
  const [eventPointsMap, setEventPointsMap] = useState<Record<string, number>>(
    {}
  );
  const [eventHoursMap, setEventHoursMap] = useState<Record<string, number>>(
    {}
  );
  const [extraStudentEmail, setExtraStudentEmail] = useState(
    "karthik@student.edu"
  );
  const [extraPoints, setExtraPoints] = useState<number>(25);
  const [extraHours, setExtraHours] = useState<number>(1);
  const [extraReason, setExtraReason] = useState(
    "Extra contribution & leadership bonus"
  );
  const [awardFeedback, setAwardFeedback] = useState<string | null>(null);

  // Admin CSV retrieval state
  const [csvFilterCollege, setCsvFilterCollege] = useState("ALL");
  const [csvStatusMsg, setCsvStatusMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "n-1",
      message: "New student volunteer registration request: Anitha Ramesh",
      forRoles: ["ADMIN"],
    },
    {
      id: "n-2",
      message: "New admin account pending approval: newadmin@maatram.org",
      forRoles: ["SUPER_ADMIN"],
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile edit state
  const [phoneInput, setPhoneInput] = useState("");
  const [collegeInput, setCollegeInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");
  const [yearOfPassedOutInput, setYearOfPassedOutInput] = useState("");
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  const pushNotification = (
    message: string,
    forRoles: UserRole[],
    recipientEmail?: string
  ) => {
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        message,
        forRoles,
        recipientEmail: recipientEmail?.toLowerCase(),
      },
      ...prev,
    ]);
  };

  const visibleNotifications = currentUser
    ? notifications.filter((n) => {
        if (!n.forRoles.includes(currentUser.role)) return false;
        if (n.recipientEmail) {
          return n.recipientEmail === currentUser.email.toLowerCase();
        }
        return true;
      })
    : [];

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
          /_/g,
          " "
        )}. Please select the matching portal role above.`
      );
      return;
    }

    if (matchedUser.status === "PENDING_APPROVAL") {
      setAuthError(
        isVolunteerRole(matchedUser.role)
          ? "Your volunteer request is pending admin approval. You can access the portal once approved by an admin."
          : "Your account is pending approval. Please check back once approved."
      );
      return;
    }

    if (matchedUser.status === "REJECTED") {
      setAuthError("Your account registration was declined.");
      return;
    }

    setCurrentUserId(matchedUser.id);
    setPhoneInput(matchedUser.phone);
    setCollegeInput(matchedUser.college || "");
    setDesignationInput(matchedUser.designation || "");
    setYearOfPassedOutInput(matchedUser.yearOfPassedOut || "");
    setProfileSavedMsg(null);
    setActiveTab(
      isVolunteerRole(matchedUser.role) ? "volunteer-dashboard" : "dashboard"
    );
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

    const assignedRole: UserRole =
      selectedRole === "SUPER_ADMIN" ? "ADMIN" : selectedRole;

    const categoryLabel =
      assignedRole === "STUDENT_VOLUNTEER"
        ? "Student Volunteer"
        : assignedRole === "ALUMNI_VOLUNTEER"
        ? "Alumni Volunteer"
        : "Coordinator";

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      name: regName.trim(),
      email: normalizedEmail,
      password: regPassword,
      phone: regPhone.trim(),
      role: assignedRole,
      status: "PENDING_APPROVAL",
      categoryLabel,
      college:
        assignedRole === "STUDENT_VOLUNTEER"
          ? regCollege.trim()
          : regCollege.trim() || undefined,
      designation:
        assignedRole === "ALUMNI_VOLUNTEER"
          ? regDesignation.trim()
          : undefined,
      yearOfPassedOut: isVolunteerRole(assignedRole)
        ? regYearOfPassedOut.trim()
        : undefined,
      points: 0,
      verifiedHours: 0,
      completedActivities: 0,
      consecutiveWeeks: 0,
    };

    setUsers((prev) => [...prev, newUser]);
    pushNotification(
      `New ${categoryLabel.toLowerCase()} registration request: ${newUser.name}`,
      assignedRole === "ADMIN" ? ["SUPER_ADMIN"] : ["ADMIN"]
    );
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPassword("");
    setRegCollege("");
    setRegDesignation("");
    setRegYearOfPassedOut("");
    setAuthMode("signin");
    setAuthSuccess(
      isVolunteerRole(assignedRole)
        ? `${categoryLabel} request submitted! You can sign in once an admin approves your request.`
        : "Admin request submitted! You can sign in once a super admin approves your request."
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
      STUDENT_VOLUNTEER: "STUDENT VOLUNTEER",
      ALUMNI_VOLUNTEER: "ALUMNI VOLUNTEER",
      ADMIN: "ADMIN",
      SUPER_ADMIN: "SUPER ADMIN",
    };

    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E5D8EC] overflow-hidden">
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

          {authMode !== "forgot" && (
            <div className="px-6 pt-5 pb-4 bg-[#FAF8FB] border-b border-[#EFE8F3]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                SELECT PORTAL ROLE
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    "STUDENT_VOLUNTEER",
                    "ALUMNI_VOLUNTEER",
                    "ADMIN",
                    "SUPER_ADMIN",
                  ] as UserRole[]
                ).map((role) => {
                  const active = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleSelectLoginRole(role)}
                      className={`py-2 px-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition cursor-pointer border ${
                        active
                          ? "bg-[#F3EAF6] text-[#5A2961] border-[#6F3577] shadow-2xs"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#C8B2D0]"
                      }`}
                    >
                      {roleLabelMap[role]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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

              {selectedRole === "STUDENT_VOLUNTEER" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                      College Name
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={regCollege}
                        onChange={(e) => setRegCollege(e.target.value)}
                        placeholder="e.g., College of Engineering, Guindy"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                      Year of Passed Out
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={regYearOfPassedOut}
                        onChange={(e) => setRegYearOfPassedOut(e.target.value)}
                        placeholder="e.g., 2027"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedRole === "ALUMNI_VOLUNTEER" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                      Designation
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        placeholder="e.g., Software Engineer / Product Manager"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                      Year of Passed Out
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={regYearOfPassedOut}
                        onChange={(e) => setRegYearOfPassedOut(e.target.value)}
                        placeholder="e.g., 2022"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6F3577]"
                      />
                    </div>
                  </div>
                </>
              )}

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
  const isAdmin = currentUser.role === "ADMIN";
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const isCurrentUserVolunteer = isVolunteerRole(currentUser.role);

  const volunteers = users.filter((u) => isVolunteerRole(u.role));
  const studentVolunteers = users.filter((u) => u.role === "STUDENT_VOLUNTEER");
  const pendingVolunteersForAdmin = volunteers.filter(
    (u) => u.status === "PENDING_APPROVAL"
  );
  const admins = users.filter((u) => u.role === "ADMIN");
  const pendingCount = users.filter(
    (u) => u.status === "PENDING_APPROVAL"
  ).length;

  // College-level volunteering statistics for Super Admin graph
  const collegeMap = new Map<string, CollegeStat>();
  for (const v of volunteers) {
    const collegeName = (v.college || "General / Unspecified College").trim();
    const existing = collegeMap.get(collegeName) || {
      college: collegeName,
      studentCount: 0,
      totalVolunteers: 0,
      approvedVolunteers: 0,
      totalPoints: 0,
      totalHours: 0,
      completedActivities: 0,
      avgPointsPerVolunteer: 0,
    };

    existing.totalVolunteers += 1;
    if (v.role === "STUDENT_VOLUNTEER") existing.studentCount += 1;
    if (v.status === "APPROVED") existing.approvedVolunteers += 1;
    existing.totalPoints += v.points;
    existing.totalHours += v.verifiedHours;
    existing.completedActivities += v.completedActivities;
    existing.avgPointsPerVolunteer =
      existing.totalVolunteers > 0
        ? Math.round(existing.totalPoints / existing.totalVolunteers)
        : 0;

    collegeMap.set(collegeName, existing);
  }

  const collegeStats = Array.from(collegeMap.values()).sort(
    (a, b) => b.totalPoints - a.totalPoints || b.totalHours - a.totalHours
  );
  const maxCollegePoints = Math.max(
    1,
    ...collegeStats.map((c) => c.totalPoints)
  );
  const maxCollegeHours = Math.max(1, ...collegeStats.map((c) => c.totalHours));

  const uniqueColleges = Array.from(
    new Set(
      ideas.map((i) => i.college.trim()).filter((c) => c.length > 0)
    )
  );

  const filteredIdeas =
    csvFilterCollege === "ALL"
      ? ideas
      : ideas.filter(
          (i) => i.college.toLowerCase() === csvFilterCollege.toLowerCase()
        );

  const handleDownloadIdeasCsv = () => {
    const headers = [
      "ID",
      "Title",
      "Category",
      "College",
      "Submitted By",
      "Date",
      "Votes",
      "Summary",
    ];
    const rows = filteredIdeas.map((item) =>
      [
        escapeCsvField(item.id),
        escapeCsvField(item.title),
        escapeCsvField(item.category),
        escapeCsvField(item.college),
        escapeCsvField(item.submittedBy),
        escapeCsvField(item.date),
        escapeCsvField(item.votes),
        escapeCsvField(item.summary),
      ].join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "maatram-volunteer-ideas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvStatusMsg(
      `Retrieved and downloaded ${filteredIdeas.length} idea(s) to maatram-volunteer-ideas.csv.`
    );
  };

  const handleUploadIdeasCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length <= 1) {
        setCsvStatusMsg("CSV file had no idea rows to retrieve.");
        return;
      }

      const imported: VolunteerIdea[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (!cols[0] && !cols[1]) continue;

        const hasIdCol = cols.length >= 8;
        const title = hasIdCol ? cols[1] : cols[0];
        const category = hasIdCol ? cols[2] : cols[1];
        const college = hasIdCol ? cols[3] : cols[2];
        const submittedBy = hasIdCol ? cols[4] : cols[3];
        const date = hasIdCol ? cols[5] : cols[4];
        const votes = Number(hasIdCol ? cols[6] : cols[5]) || 0;
        const summary = hasIdCol ? cols[7] : cols[6];

        if (title) {
          imported.push({
            id: `idea-csv-${Date.now()}-${i}`,
            title,
            category: category || "General",
            college: college || "General College",
            submittedBy: submittedBy || "Volunteer",
            date: date || "2026-11-27",
            votes,
            summary: summary || "Retrieved from CSV file",
          });
        }
      }

      if (imported.length === 0) {
        setCsvStatusMsg("Could not parse valid idea rows from the CSV file.");
        return;
      }

      setIdeas((prev) => [...imported, ...prev]);
      setCsvStatusMsg(
        `Retrieved ${imported.length} idea(s) from "${file.name}".`
      );
      pushNotification(
        `Retrieved ${imported.length} volunteer idea(s) from CSV`,
        ["ADMIN", "SUPER_ADMIN"]
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const leaderboardVolunteers = [...volunteers].sort(
    (a, b) => b.points - a.points || b.verifiedHours - a.verifiedHours
  );

  const handleUserApproval = (
    userId: string,
    nextStatus: "APPROVED" | "REJECTED",
    roleLabel: UserRole
  ) => {
    if (isVolunteerRole(roleLabel) && !isAdmin) return;
    if (roleLabel === "ADMIN" && !isSuperAdmin) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    const target = users.find((u) => u.id === userId);
    if (target) {
      pushNotification(
        `${roleLabel === "ADMIN" ? "Admin" : "Volunteer"} ${target.name} marked as ${nextStatus}`,
        roleLabel === "ADMIN" ? ["SUPER_ADMIN"] : ["ADMIN"],
        isVolunteerRole(roleLabel) ? target.email : undefined
      );
    }
  };

  // Award the exact same points & hours to every approved participant of a specific event
  const handleAwardEqualPointsForEvent = (opp: Opportunity) => {
    if (!isAdminOrSuperAdmin) return;

    const eventApprovedApps = applications.filter(
      (a) => a.opportunityId === opp.id && a.status === "APPROVED"
    );
    if (eventApprovedApps.length === 0) {
      setAwardFeedback(
        `No approved participants found in "${opp.title}" yet.`
      );
      return;
    }

    const ptsToAdd = Math.max(
      1,
      Number(eventPointsMap[opp.id] ?? opp.defaultPoints ?? 80)
    );
    const hrsToAdd = Math.max(
      0,
      Number(eventHoursMap[opp.id] ?? opp.defaultHours ?? 4)
    );

    const participantEmails = new Set(
      eventApprovedApps.map((a) => a.volunteerEmail.toLowerCase())
    );

    setUsers((prev) =>
      prev.map((u) =>
        participantEmails.has(u.email.toLowerCase())
          ? {
              ...u,
              points: u.points + ptsToAdd,
              verifiedHours: u.verifiedHours + hrsToAdd,
              completedActivities: u.completedActivities + 1,
            }
          : u
      )
    );

    const newRecords: VolunteerActivityRecord[] = eventApprovedApps.map(
      (app, index) => ({
        id: `act-${Date.now()}-${index}`,
        volunteerEmail: app.volunteerEmail,
        activityTitle: opp.title,
        date: "2026-11-27",
        hours: hrsToAdd,
        pointsAwarded: ptsToAdd,
        note: "Equal event participation points awarded by admin",
      })
    );

    setActivityHistory((prev) => [...newRecords, ...prev]);

    for (const app of eventApprovedApps) {
      pushNotification(
        `You received +${ptsToAdd} pts & +${hrsToAdd} hrs for ${opp.title}`,
        ["STUDENT_VOLUNTEER", "ALUMNI_VOLUNTEER"],
        app.volunteerEmail
      );
    }

    pushNotification(
      `Awarded +${ptsToAdd} pts & +${hrsToAdd} hrs equally to ${eventApprovedApps.length} participant(s) in ${opp.title}`,
      ["ADMIN", "SUPER_ADMIN"]
    );

    setAwardFeedback(
      `Awarded +${ptsToAdd} points and +${hrsToAdd} hours equally to all ${eventApprovedApps.length} participant(s) in "${opp.title}".`
    );
  };

  // Award extra bonus points separately to a particular student
  const handleAwardExtraPointsToStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrSuperAdmin) return;

    const ptsToAdd = Math.max(1, Number(extraPoints) || 0);
    const hrsToAdd = Math.max(0, Number(extraHours) || 0);
    const targetStudent = studentVolunteers.find(
      (s) => s.email.toLowerCase() === extraStudentEmail.toLowerCase()
    );

    if (!targetStudent) {
      setAwardFeedback("Please select a valid student volunteer.");
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === targetStudent.email.toLowerCase()
          ? {
              ...u,
              points: u.points + ptsToAdd,
              verifiedHours: u.verifiedHours + hrsToAdd,
            }
          : u
      )
    );

    const bonusRecord: VolunteerActivityRecord = {
      id: `act-extra-${Date.now()}`,
      volunteerEmail: targetStudent.email,
      activityTitle: extraReason.trim() || "Extra Student Bonus Points",
      date: "2026-11-27",
      hours: hrsToAdd,
      pointsAwarded: ptsToAdd,
      note: "Extra individual points awarded by admin",
    };

    setActivityHistory((prev) => [bonusRecord, ...prev]);
    pushNotification(
      `You received +${ptsToAdd} extra bonus pts (${extraReason.trim() || "Admin recognition"})`,
      ["STUDENT_VOLUNTEER"],
      targetStudent.email
    );
    pushNotification(
      `Awarded +${ptsToAdd} extra pts to student ${targetStudent.name}`,
      ["ADMIN", "SUPER_ADMIN"]
    );
    setAwardFeedback(
      `Awarded +${ptsToAdd} extra points (and +${hrsToAdd} hrs) separately to ${targetStudent.name}.`
    );
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
              ? {
                  ...o,
                  filledSlots: Math.min(o.totalSlots, o.filledSlots + 1),
                  studentsCount:
                    appItem.volunteerRole === "STUDENT_VOLUNTEER"
                      ? o.studentsCount + 1
                      : o.studentsCount,
                }
              : o
          )
        );
      }
      pushNotification(
        `Your application for ${appItem.opportunityTitle} was ${decision.toLowerCase()}`,
        ["STUDENT_VOLUNTEER", "ALUMNI_VOLUNTEER"],
        appItem.volunteerEmail
      );
      pushNotification(
        `Application from ${appItem.volunteerName} ${decision.toLowerCase()} for ${appItem.opportunityTitle}`,
        ["ADMIN", "SUPER_ADMIN"]
      );
    }
  };

  const handleCreateOpportunity = (
    newOppData: Omit<Opportunity, "id" | "filledSlots" | "studentsCount">
  ) => {
    if (!isAdminOrSuperAdmin) return;

    const created: Opportunity = {
      ...newOppData,
      id: `opp-${Date.now()}`,
      filledSlots: 0,
      studentsCount: 0,
      defaultPoints: 80,
      defaultHours: 5,
    };
    setOpportunities((prev) => [created, ...prev]);
    pushNotification(`Created opportunity: ${created.title}`, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
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
      volunteerRole: currentUser.role,
      status: "PENDING",
    };
    setApplications((prev) => [newApp, ...prev]);

    if (currentUser.role === "STUDENT_VOLUNTEER") {
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opp.id ? { ...o, studentsCount: o.studentsCount + 1 } : o
        )
      );
    }

    pushNotification(`${currentUser.name} applied for ${opp.title}`, ["ADMIN"]);
  };

  const handleWithdrawApplication = (appId: string) => {
    const targetApp = applications.find(
      (a) => a.id === appId && a.volunteerEmail === currentUser.email
    );
    if (!targetApp) return;

    setApplications((prev) => prev.filter((a) => a.id !== appId));

    setOpportunities((prev) =>
      prev.map((o) => {
        if (o.id !== targetApp.opportunityId) return o;
        return {
          ...o,
          filledSlots:
            targetApp.status === "APPROVED"
              ? Math.max(0, o.filledSlots - 1)
              : o.filledSlots,
          studentsCount:
            targetApp.volunteerRole === "STUDENT_VOLUNTEER" ||
            currentUser.role === "STUDENT_VOLUNTEER"
              ? Math.max(0, o.studentsCount - 1)
              : o.studentsCount,
        };
      })
    );

    pushNotification(
      `${currentUser.name} removed application for ${targetApp.opportunityTitle}`,
      ["ADMIN"]
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              phone: phoneInput,
              college:
                currentUser.role === "STUDENT_VOLUNTEER"
                  ? collegeInput.trim()
                  : u.college,
              designation:
                currentUser.role === "ALUMNI_VOLUNTEER"
                  ? designationInput.trim()
                  : u.designation,
              yearOfPassedOut: yearOfPassedOutInput.trim(),
            }
          : u
      )
    );
    setProfileSavedMsg("Profile settings updated successfully.");
    pushNotification(
      "Your profile details were updated",
      ["STUDENT_VOLUNTEER", "ALUMNI_VOLUNTEER"],
      currentUser.email
    );
  };

  const myApplications = applications.filter(
    (a) => a.volunteerEmail === currentUser.email
  );
  const myHistory = activityHistory.filter(
    (h) => h.volunteerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );
  const volunteerBadges = getVolunteerBadges(currentUser);
  const unlockedBadgeCount = volunteerBadges.filter((b) => b.unlocked).length;

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1F1624]">
      <PortalHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        notifications={visibleNotifications.map((n) => n.message)}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications((s) => !s)}
        onClearNotifications={() => setNotifications([])}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {isAdminOrSuperAdmin && activeTab === "dashboard" && (
          <>
            <DashboardOverview
              opportunities={opportunities}
              volunteersCount={volunteers.length}
              pendingApprovalsCount={pendingCount}
            />

            {awardFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {awardFeedback}
              </div>
            )}

            {/* Individual Event Participants & Equal Points Awarding */}
            <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#522A5B] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#6F3577]" />
                    <span>
                      Event Participants & Equal Event Points Distribution
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    View individual participants for each event and award equal
                    points to everyone who participated in that event.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("opportunities")}
                  className="text-xs font-semibold text-[#6F3577] hover:underline cursor-pointer"
                >
                  Post / Manage Events →
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {opportunities.map((opp) => {
                  const eventParticipants = applications.filter(
                    (a) =>
                      a.opportunityId === opp.id && a.status === "APPROVED"
                  );
                  const ptsVal =
                    eventPointsMap[opp.id] ?? opp.defaultPoints ?? 80;
                  const hrsVal =
                    eventHoursMap[opp.id] ?? opp.defaultHours ?? 4;

                  return (
                    <div
                      key={opp.id}
                      className="rounded-xl border border-[#E5D8EC] bg-[#FAF8FB] p-5 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F3EAF6] text-[#522A5B]">
                            {opp.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {opp.location} • {opp.date}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#1F1624] mt-2">
                          {opp.title}
                        </h3>

                        <div className="mt-3">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Participants ({eventParticipants.length})
                          </div>
                          {eventParticipants.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">
                              No approved participants yet.
                            </p>
                          ) : (
                            <ul className="space-y-1.5">
                              {eventParticipants.map((p) => {
                                const userObj = users.find(
                                  (u) =>
                                    u.email.toLowerCase() ===
                                    p.volunteerEmail.toLowerCase()
                                );
                                return (
                                  <li
                                    key={p.id}
                                    className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-lg border border-[#EFE8F3]"
                                  >
                                    <div>
                                      <span className="font-semibold text-[#1F1624]">
                                        {p.volunteerName}
                                      </span>
                                      <span className="text-gray-500 ml-1.5">
                                        ({p.volunteerEmail})
                                      </span>
                                    </div>
                                    <span className="font-bold text-[#6F3577]">
                                      {userObj ? `${userObj.points} pts` : ""}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E5D8EC] flex flex-wrap items-end gap-2.5">
                        <div className="w-24">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Equal Points
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={ptsVal}
                            onChange={(e) =>
                              setEventPointsMap((prev) => ({
                                ...prev,
                                [opp.id]: Number(e.target.value),
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5D8EC] bg-white text-xs font-semibold"
                          />
                        </div>

                        <div className="w-24">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Equal Hours
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="0.5"
                            value={hrsVal}
                            onChange={(e) =>
                              setEventHoursMap((prev) => ({
                                ...prev,
                                [opp.id]: Number(e.target.value),
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5D8EC] bg-white text-xs font-semibold"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={eventParticipants.length === 0}
                          onClick={() => handleAwardEqualPointsForEvent(opp)}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#6F3577] hover:bg-[#522A5B] disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
                        >
                          Give Same Points to All ({eventParticipants.length})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Award Extra Points Separately to a Particular Student */}
            <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-[#6F3577]" />
                <h2 className="text-lg font-bold text-[#522A5B]">
                  Award Extra Points Separately to a Particular Student
                </h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Grant additional individual bonus points to a specific student
                volunteer on top of equal event points.
              </p>

              <form
                onSubmit={handleAwardExtraPointsToStudent}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                    Student Volunteer
                  </label>
                  <select
                    value={extraStudentEmail}
                    onChange={(e) => setExtraStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm bg-white focus:outline-none focus:border-[#6F3577]"
                  >
                    {studentVolunteers.map((s) => (
                      <option key={s.id} value={s.email}>
                        {s.name} ({s.college || "Student"}) • {s.points} pts
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                    Reason / Contribution
                  </label>
                  <input
                    type="text"
                    required
                    value={extraReason}
                    onChange={(e) => setExtraReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#6F3577]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                    Extra Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={extraPoints}
                    onChange={(e) => setExtraPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#6F3577]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1624] mb-1">
                    Extra Hours
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    required
                    value={extraHours}
                    onChange={(e) => setExtraHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#6F3577]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#6F3577] hover:bg-[#522A5B] text-white text-sm font-semibold transition cursor-pointer"
                >
                  Give Extra Points
                </button>
              </form>
            </div>

            {isSuperAdmin && (
              <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#522A5B] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#6F3577]" />
                      <span>College Volunteering Performance Graph</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Visual comparison of points earned and verified hours across
                      colleges.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("college-stats")}
                    className="text-xs font-semibold text-[#6F3577] hover:underline cursor-pointer"
                  >
                    Expand Graph View →
                  </button>
                </div>

                <div className="space-y-4">
                  {collegeStats.map((stat) => {
                    const ptsWidth = Math.max(
                      6,
                      Math.round((stat.totalPoints / maxCollegePoints) * 100)
                    );
                    const hrsWidth = Math.max(
                      6,
                      Math.round((stat.totalHours / maxCollegeHours) * 100)
                    );
                    return (
                      <div
                        key={stat.college}
                        className="rounded-xl border border-[#EFE8F3] p-4 bg-[#FAF9FB] space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#1F1624]">
                            {stat.college}
                          </span>
                          <span className="text-xs font-semibold text-[#522A5B]">
                            {stat.studentCount} Students • {stat.totalPoints}{" "}
                            pts • {stat.totalHours} hrs
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="w-16 text-gray-500 font-medium">
                              Points
                            </span>
                            <div className="flex-1 h-3 rounded-full bg-[#ECE3F0] overflow-hidden">
                              <div
                                style={{ width: `${ptsWidth}%` }}
                                className="h-full rounded-full bg-[#6F3577] transition-all"
                              />
                            </div>
                            <span className="w-16 text-right font-bold text-[#6F3577]">
                              {stat.totalPoints}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <span className="w-16 text-gray-500 font-medium">
                              Hours
                            </span>
                            <div className="flex-1 h-3 rounded-full bg-[#ECE3F0] overflow-hidden">
                              <div
                                style={{ width: `${hrsWidth}%` }}
                                className="h-full rounded-full bg-amber-500 transition-all"
                              />
                            </div>
                            <span className="w-16 text-right font-bold text-amber-600">
                              {stat.totalHours}h
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {isSuperAdmin && activeTab === "college-stats" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#522A5B]">
                College Volunteering Performance Graph
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Graphical comparison of college volunteering performance across
                total points, verified hours, and student participation.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#1F1624] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#6F3577]" />
                  <span>Points & Verified Hours by College</span>
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-[#6F3577]">
                    <span className="w-3 h-3 rounded-xs bg-[#6F3577] inline-block" />
                    Points Earned
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-amber-600">
                    <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                    Verified Hours
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {collegeStats.map((stat, idx) => {
                  const ptsPercent = Math.max(
                    8,
                    Math.round((stat.totalPoints / maxCollegePoints) * 100)
                  );
                  const hrsPercent = Math.max(
                    8,
                    Math.round((stat.totalHours / maxCollegeHours) * 100)
                  );

                  return (
                    <div
                      key={stat.college}
                      className="rounded-xl border border-[#E5D8EC] p-4 bg-[#FAF8FB] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-sm text-[#1F1624]">
                          #{idx + 1} {stat.college}
                        </div>
                        <div className="text-xs font-semibold text-[#522A5B]">
                          {stat.studentCount} Students •{" "}
                          {stat.completedActivities} Activities • Avg{" "}
                          {stat.avgPointsPerVolunteer} pts/volunteer
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-600">
                              Total Points
                            </span>
                            <span className="font-bold text-[#6F3577]">
                              {stat.totalPoints} pts ({ptsPercent}%)
                            </span>
                          </div>
                          <div className="w-full h-4 rounded-full bg-[#E8DDF0] overflow-hidden">
                            <div
                              style={{ width: `${ptsPercent}%` }}
                              className="h-full rounded-full bg-[#6F3577] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-600">
                              Verified Hours
                            </span>
                            <span className="font-bold text-amber-600">
                              {stat.totalHours} hrs ({hrsPercent}%)
                            </span>
                          </div>
                          <div className="w-full h-4 rounded-full bg-[#F5EAD3] overflow-hidden">
                            <div
                              style={{ width: `${hrsPercent}%` }}
                              className="h-full rounded-full bg-amber-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isAdminOrSuperAdmin && activeTab === "csv-ideas" && (
          <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#522A5B] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#6F3577]" />
                  <span>Volunteer Ideas & CSV Retrieval</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Retrieve/export submitted volunteer ideas as a CSV file or load
                  ideas from an external CSV file.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={csvFilterCollege}
                  onChange={(e) => setCsvFilterCollege(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#E5D8EC] text-xs font-semibold bg-white text-[#1F1624]"
                >
                  <option value="ALL">All Colleges</option>
                  {uniqueColleges.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleDownloadIdeasCsv}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6F3577] hover:bg-[#522A5B] text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Retrieve Ideas CSV</span>
                </button>

                <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F3EAF6] hover:bg-[#E5D8EC] text-[#522A5B] text-xs font-semibold transition cursor-pointer border border-[#D7C2E0]">
                  <Upload className="w-4 h-4" />
                  <span>Import From CSV</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleUploadIdeasCsv}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {csvStatusMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {csvStatusMsg}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5D8EC] text-xs uppercase text-[#522A5B]">
                    <th className="py-3 px-4">Idea Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Submitted By</th>
                    <th className="py-3 px-4">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIdeas.map((idea) => (
                    <tr
                      key={idea.id}
                      className="border-b border-[#F3EAF6] text-sm"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1F1624]">
                          {idea.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {idea.summary}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3EAF6] text-[#522A5B]">
                          {idea.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{idea.college}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {idea.submittedBy}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#6F3577]">
                        {idea.votes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isAdminOrSuperAdmin && activeTab === "opportunities" && (
          <div className="space-y-6">
            <OpportunitiesManager
              opportunities={opportunities}
              onCreateOpportunity={handleCreateOpportunity}
            />

            <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#522A5B]">
                Individual Participants Under Each Event
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.map((opp) => {
                  const eventParticipants = applications.filter(
                    (a) =>
                      a.opportunityId === opp.id && a.status === "APPROVED"
                  );
                  return (
                    <div
                      key={opp.id}
                      className="rounded-xl border border-[#E5D8EC] p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm text-[#1F1624]">
                            {opp.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {opp.location} • {opp.date}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#F3EAF6] text-[#522A5B] text-xs font-bold">
                          {eventParticipants.length} Participated
                        </span>
                      </div>

                      {eventParticipants.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                          No approved participants yet.
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {eventParticipants.map((p) => (
                            <li
                              key={p.id}
                              className="text-xs text-[#1F1624] bg-[#FAF8FB] px-2.5 py-1.5 rounded-md border border-[#EFE8F3]"
                            >
                              {p.volunteerName} —{" "}
                              <span className="text-gray-500">
                                {p.volunteerEmail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isAdminOrSuperAdmin && activeTab === "applications" && (
          <ApplicationsTable
            applications={applications}
            onDecision={handleApplicationDecision}
          />
        )}

        {isAdmin && activeTab === "volunteers" && (
          <UserApprovalsTable
            title="Pending Volunteer Registration Requests"
            nameHeader="Name"
            approveLabel="Approve"
            roleType="STUDENT_VOLUNTEER"
            users={pendingVolunteersForAdmin}
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

        {isCurrentUserVolunteer && activeTab === "volunteer-dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#522A5B]">
                Volunteer Dashboard
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {currentUser.name} (
                {currentUser.role === "STUDENT_VOLUNTEER"
                  ? `${currentUser.college || "Student"} • Class of ${
                      currentUser.yearOfPassedOut || "—"
                    }`
                  : `${currentUser.designation || "Alumni"} • Class of ${
                      currentUser.yearOfPassedOut || "—"
                    }`}
                )
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#E5D8EC] p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Total Points
                </div>
                <div className="text-2xl font-extrabold text-[#6F3577] mt-1">
                  {currentUser.points} pts
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E5D8EC] p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Verified Hours
                </div>
                <div className="text-2xl font-extrabold text-[#522A5B] mt-1">
                  {currentUser.verifiedHours} hrs
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E5D8EC] p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Completed Activities
                </div>
                <div className="text-2xl font-extrabold text-[#1F1624] mt-1">
                  {currentUser.completedActivities}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E5D8EC] p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Unlocked Badges
                </div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  {unlockedBadgeCount} / {volunteerBadges.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {isCurrentUserVolunteer && activeTab === "browse" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#522A5B]">
                Opportunity Explorer
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

                    <div className="pt-4 border-t border-[#F3EAF6] flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold text-[#522A5B]">
                        {remaining} of {opp.totalSlots} slots open
                      </div>

                      {existingApp ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F3EAF6] text-[#522A5B]">
                            {existingApp.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleWithdrawApplication(existingApp.id)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
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

        {isCurrentUserVolunteer && activeTab === "my-applications" && (
          <div className="bg-white rounded-xl border border-[#E5D8EC] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#522A5B] mb-4">
              My Applications
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
                      <th className="py-3 px-4 text-right">Action</th>
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
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleWithdrawApplication(app.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition cursor-pointer"
                          >
                            Remove Application
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {isCurrentUserVolunteer && activeTab === "hours-history" && (
          <div className="bg-white rounded-xl border border-[#E5D8EC] p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#522A5B] flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Hours & History</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified hours and points awarded for your activities.
                </p>
              </div>
              <div className="text-sm font-bold text-[#6F3577]">
                Total: {currentUser.verifiedHours} hrs • {currentUser.points} pts
              </div>
            </div>

            {myHistory.length === 0 ? (
              <p className="text-sm text-gray-500">
                No verified activity records yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5D8EC] text-xs uppercase text-[#522A5B]">
                      <th className="py-3 px-4">Activity</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Hours</th>
                      <th className="py-3 px-4">Points Awarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#F3EAF6] text-sm"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1F1624]">
                            {item.activityTitle}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.note}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.date}</td>
                        <td className="py-3 px-4 font-semibold">
                          {item.hours} hrs
                        </td>
                        <td className="py-3 px-4 font-bold text-[#6F3577]">
                          +{item.pointsAwarded} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {isCurrentUserVolunteer && activeTab === "badges-leaderboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1F1624]">
                Gamification & Leaderboard
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Recognizing consistent volunteer dedication.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#1F1624] flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>My Badges & Milestones</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {volunteerBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-4 text-center border flex flex-col items-center justify-between gap-2 ${
                      badge.unlocked
                        ? "bg-[#FFFBEB] border-amber-200"
                        : "bg-[#F9FAFB] border-gray-200 opacity-75"
                    }`}
                  >
                    <div className="text-2xl">{badge.badgeText}</div>
                    <div>
                      <div className="text-xs font-bold text-[#1F1624]">
                        {badge.title}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {badge.requirement}
                      </div>
                    </div>
                    {badge.unlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold uppercase">
                        LOCKED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5D8EC] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#1F1624] flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Volunteer Leaderboard</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Volunteer</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Verified Hours</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardVolunteers.map((vol, idx) => {
                      const isMe = vol.id === currentUser.id;
                      return (
                        <tr
                          key={vol.id}
                          className={`border-b border-gray-100 text-sm ${
                            isMe ? "bg-[#F3EAF6]/60" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold">
                            {idx === 0
                              ? "🥇 #1"
                              : idx === 1
                              ? "🥈 #2"
                              : idx === 2
                              ? "🥉 #3"
                              : `#${idx + 1}`}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#1F1624]">
                            {vol.name}{" "}
                            {isMe && (
                              <span className="ml-1.5 text-[11px] font-bold text-[#6F3577]">
                                (You)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {vol.role === "ALUMNI_VOLUNTEER"
                              ? "Alumni"
                              : "Student"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#1F1624]">
                            {vol.verifiedHours} hrs
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-amber-600">
                            {vol.points} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {isCurrentUserVolunteer && activeTab === "profile" && (
          <div className="max-w-lg bg-white rounded-xl border border-[#E5D8EC] p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#522A5B] mb-1">
              Profile & Settings
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {currentUser.role === "STUDENT_VOLUNTEER"
                ? "Manage your student volunteer contact details, college, and year of passed out."
                : "Manage your alumni volunteer contact details, designation, and year of passed out."}
            </p>

            {profileSavedMsg && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
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
                  Volunteer Type
                </label>
                <input
                  type="text"
                  value={
                    currentUser.role === "STUDENT_VOLUNTEER"
                      ? "Student Volunteer"
                      : "Alumni Volunteer"
                  }
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
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#7A4286]"
                />
              </div>

              {currentUser.role === "STUDENT_VOLUNTEER" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      College Name
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeInput}
                      onChange={(e) => setCollegeInput(e.target.value)}
                      placeholder="Enter your college name"
                      className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#7A4286]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Year of Passed Out
                    </label>
                    <input
                      type="text"
                      required
                      value={yearOfPassedOutInput}
                      onChange={(e) => setYearOfPassedOutInput(e.target.value)}
                      placeholder="e.g., 2027"
                      className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#7A4286]"
                    />
                  </div>
                </>
              )}

              {currentUser.role === "ALUMNI_VOLUNTEER" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      required
                      value={designationInput}
                      onChange={(e) => setDesignationInput(e.target.value)}
                      placeholder="Enter your designation"
                      className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#7A4286]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Year of Passed Out
                    </label>
                    <input
                      type="text"
                      required
                      value={yearOfPassedOutInput}
                      onChange={(e) => setYearOfPassedOutInput(e.target.value)}
                      placeholder="e.g., 2022"
                      className="w-full px-3 py-2 rounded-lg border border-[#E5D8EC] text-sm focus:outline-none focus:border-[#7A4286]"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#7A4286] text-white hover:bg-[#522A5B] transition cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}