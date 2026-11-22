"use client";

import React from "react";
import { UserAccount, UserRole } from "@/data/mockData";

interface UserApprovalsTableProps {
  title: string;
  nameHeader: string;
  approveLabel: string;
  roleType: UserRole;
  users: UserAccount[];
  onApproveUser: (
    userId: string,
    nextStatus: "APPROVED" | "REJECTED",
    roleLabel: UserRole
  ) => void;
}

export default function UserApprovalsTable({
  title,
  nameHeader,
  approveLabel,
  roleType,
  users,
  onApproveUser,
}: UserApprovalsTableProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB] overflow-x-auto">
      <h2 className="text-lg font-bold text-[#522A5B] mb-4">{title}</h2>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#E7DCEB] text-gray-600">
            <th className="py-3 px-4">{nameHeader}</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Phone</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-[#F3EAF6]">
              <td className="py-3 px-4 font-medium">{u.name}</td>
              <td className="py-3 px-4">{u.email}</td>
              <td className="py-3 px-4">{u.phone}</td>
              <td className="py-3 px-4 font-semibold">{u.status}</td>
              <td className="py-3 px-4">
                {u.status === "PENDING_APPROVAL" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onApproveUser(u.id, "APPROVED", roleType)}
                      className="px-3 py-1.5 rounded-lg bg-[#522A5B] text-white text-xs font-semibold hover:bg-[#7A4286] cursor-pointer"
                    >
                      {approveLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveUser(u.id, "REJECTED", roleType)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-100 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
