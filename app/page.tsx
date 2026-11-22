"use client";

import React, { useState } from "react";
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

export default function MaatramVolunteerHubPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [applications, setApplications] =
    useState<VolunteerApplication[]>(INITIAL_APPLICATIONS);
  const [currentRole, setCurrentRole] = useState<UserRole>("SUPER_ADMIN");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [notifications, setNotifications] = useState<string[]>([
    "New volunteer registration request: Anitha Ramesh",
    "New admin account pending approval: newadmin@maatram.org",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [phoneInput, setPhoneInput] = useState("+91 98765 00001");

  const currentUser =
    users.find((u) => u.role === currentRole && u.status === "APPROVED") ||
    users.find((u) => u.role === currentRole) ||
    users[0];

  const volunteers = users.filter((u) => u.role === "VOLUNTEER");
  const admins = users.filter((u) => u.role === "ADMIN");
  const pendingCount = users.filter(
    (u) => u.status === "PENDING_APPROVAL"
  ).length;

  const pushNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev]);
  };

  const handleSwitchRole = (role: UserRole) => {
    setCurrentRole(role);
    const nextUser =
      users.find((u) => u.role === role && u.status === "APPROVED") ||
      users.find((u) => u.role === role);
    if (nextUser) {
      setPhoneInput(nextUser.phone);
    }
    setActiveTab(role === "VOLUNTEER" ? "browse" : "dashboard");
  };

  const handleUserApproval = (
    userId: string,
    nextStatus: "APPROVED" | "REJECTED",
    roleLabel: UserRole
  ) => {
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
    pushNotification(
      `${currentUser.name} applied for ${opp.title}`
    );
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
        onSwitchRole={handleSwitchRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications((s) => !s)}
        onClearNotifications={() => setNotifications([])}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* SUPER ADMIN & ADMIN VIEWS */}
        {currentRole !== "VOLUNTEER" && activeTab === "dashboard" && (
          <DashboardOverview
            opportunities={opportunities}
            volunteersCount={volunteers.length}
            pendingApprovalsCount={pendingCount}
          />
        )}

        {currentRole !== "VOLUNTEER" && activeTab === "opportunities" && (
          <OpportunitiesManager
            opportunities={opportunities}
            onCreateOpportunity={handleCreateOpportunity}
          />
        )}

        {currentRole !== "VOLUNTEER" && activeTab === "applications" && (
          <ApplicationsTable
            applications={applications}
            onDecision={handleApplicationDecision}
          />
        )}

        {currentRole !== "VOLUNTEER" && activeTab === "volunteers" && (
          <UserApprovalsTable
            title="Volunteer Registration Requests"
            nameHeader="Name"
            approveLabel="Approve"
            roleType="VOLUNTEER"
            users={volunteers}
            onApproveUser={handleUserApproval}
          />
        )}

        {currentRole === "SUPER_ADMIN" && activeTab === "admins" && (
          <UserApprovalsTable
            title="Admin Account Approvals"
            nameHeader="Admin Name"
            approveLabel="Approve Admin"
            roleType="ADMIN"
            users={admins}
            onApproveUser={handleUserApproval}
          />
        )}

        {/* VOLUNTEER VIEWS */}
        {currentRole === "VOLUNTEER" && activeTab === "browse" && (
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

        {currentRole === "VOLUNTEER" && activeTab === "my-applications" && (
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

        {currentRole === "VOLUNTEER" && activeTab === "profile" && (
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