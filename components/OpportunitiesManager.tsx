"use client";

import React, { useState } from "react";
import { Opportunity } from "@/data/mockData";

interface OpportunitiesManagerProps {
  opportunities: Opportunity[];
  onCreateOpportunity: (opp: Omit<Opportunity, "id" | "filledSlots">) => void;
}

export default function OpportunitiesManager({
  opportunities,
  onCreateOpportunity,
}: OpportunitiesManagerProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Mentorship");
  const [newLocation, setNewLocation] = useState("Chennai Hub");
  const [newSlots, setNewSlots] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateOpportunity({
      title: newTitle.trim(),
      category: newCategory,
      location: newLocation,
      date: "2026-12-20",
      totalSlots: Number(newSlots) || 10,
    });
    setNewTitle("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB] space-y-4"
      >
        <h2 className="text-lg font-bold text-[#522A5B]">Create Opportunity</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Community Health Camp"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#7A4286]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#7A4286]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#7A4286]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Total Slots
          </label>
          <input
            type="number"
            min={1}
            value={newSlots}
            onChange={(e) => setNewSlots(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#7A4286]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-[#522A5B] hover:bg-[#7A4286] text-white text-sm font-semibold transition cursor-pointer"
        >
          Add Opportunity
        </button>
      </form>

      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E7DCEB] space-y-4">
        <h2 className="text-lg font-bold text-[#522A5B]">All Opportunities</h2>
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-xl border border-[#E7DCEB] flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-[#1F1624]">{opp.title}</h3>
                <p className="text-xs text-gray-500">
                  {opp.category} • {opp.location} • {opp.date}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F3EAF6] text-[#522A5B]">
                {opp.filledSlots} / {opp.totalSlots} slots
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
