"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { VolunteerApplication } from "@/data/mockData";

interface ApplicationsTableProps {
  applications: VolunteerApplication[];
  onDecision: (appId: string, decision: "APPROVED" | "DECLINED") => void;
}

export default function ApplicationsTable({
  applications,
  onDecision,
}: ApplicationsTableProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB] overflow-x-auto">
      <h2 className="text-lg font-bold text-[#522A5B] mb-4">
        Volunteer Applications
      </h2>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#E7DCEB] text-gray-600">
            <th className="py-3 px-4">Volunteer</th>
            <th className="py-3 px-4">Opportunity</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-[#F3EAF6]">
              <td className="py-3 px-4 font-medium">{app.volunteerName}</td>
              <td className="py-3 px-4">{app.opportunityTitle}</td>
              <td className="py-3 px-4 font-semibold">{app.status}</td>
              <td className="py-3 px-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onDecision(app.id, "APPROVED")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#522A5B] text-white text-xs font-semibold hover:bg-[#7A4286] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => onDecision(app.id, "DECLINED")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-100 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
