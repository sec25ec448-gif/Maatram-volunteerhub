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
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [notifications, setNotifications] = useState<string[]>([
    "New volunteer registration request: Anitha Ramesh",
    "New admin account pending approval: newadmin@maatram.org",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentUser = users[0];
  const volunteers = users.filter((u) => u.role === "VOLUNTEER");
  const admins = users.filter((u) => u.role === "ADMIN");
  const pendingCount = users.filter(
    (u) => u.status === "PENDING_APPROVAL"
  ).length;

  const pushNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev]);
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

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1F1624]">
      <PortalHeader
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications((s) => !s)}
        onClearNotifications={() => setNotifications([])}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "dashboard" && (
          <DashboardOverview
            opportunities={opportunities}
            volunteersCount={volunteers.length}
            pendingApprovalsCount={pendingCount}
          />
        )}

        {activeTab === "opportunities" && (
          <OpportunitiesManager
            opportunities={opportunities}
            onCreateOpportunity={handleCreateOpportunity}
          />
        )}

        {activeTab === "applications" && (
          <ApplicationsTable
            applications={applications}
            onDecision={handleApplicationDecision}
          />
        )}

        {activeTab === "volunteers" && (
          <UserApprovalsTable
            title="Volunteer Registration Requests"
            nameHeader="Name"
            approveLabel="Approve"
            roleType="VOLUNTEER"
            users={volunteers}
            onApproveUser={handleUserApproval}
          />
        )}

        {activeTab === "admins" && (
          <UserApprovalsTable
            title="Admin Account Approvals"
            nameHeader="Admin Name"
            approveLabel="Approve Admin"
            roleType="ADMIN"
            users={admins}
            onApproveUser={handleUserApproval}
          />
        )}
      </main>
    </div>
  );
}
