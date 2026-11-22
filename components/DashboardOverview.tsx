"use client";

import React from "react";
import { Users, Layers, Clock } from "lucide-react";
import { Opportunity } from "@/data/mockData";

interface DashboardOverviewProps {
  opportunities: Opportunity[];
  volunteersCount: number;
  pendingApprovalsCount: number;
}

export default function DashboardOverview({
  opportunities,
  volunteersCount,
  pendingApprovalsCount,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Opportunities
            </p>
            <p className="text-3xl font-bold text-[#522A5B] mt-1">
              {opportunities.length}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F3EAF6] text-[#7A4286]">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Registered Volunteers
            </p>
            <p className="text-3xl font-bold text-[#522A5B] mt-1">
              {volunteersCount}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F3EAF6] text-[#7A4286]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Pending Approvals
            </p>
            <p className="text-3xl font-bold text-[#522A5B] mt-1">
              {pendingApprovalsCount}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F3EAF6] text-[#7A4286]">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB]">
        <h2 className="text-lg font-bold text-[#522A5B] mb-4">
          Active Volunteer Opportunities & Slot Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-xl bg-[#F3EAF6]/60 border border-[#E5D8EC] flex flex-col justify-between gap-3"
            >
              <div>
                <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#7A4286] text-white">
                  {opp.category}
                </span>
                <h3 className="text-base font-bold text-[#1F1624] mt-2">
                  {opp.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {opp.location} • {opp.date}
                </p>
              </div>
              <div className="text-xs font-semibold text-[#522A5B]">
                Slots Filled: {opp.filledSlots} / {opp.totalSlots}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
