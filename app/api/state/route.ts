import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const [
      usersRes,
      oppsRes,
      appsRes,
      historyRes,
      ideasRes,
      notifsRes,
    ] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("opportunities").select("*"),
      supabase.from("applications").select("*"),
      supabase.from("activity_history").select("*"),
      supabase.from("ideas").select("*"),
      supabase.from("notifications").select("*"),
    ]);

    const firstError =
      usersRes.error ||
      oppsRes.error ||
      appsRes.error ||
      historyRes.error ||
      ideasRes.error ||
      notifsRes.error;

    if (firstError) {
      return NextResponse.json(
        { error: firstError.message },
        { status: 500 }
      );
    }

    const users = (usersRes.data || []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      phone: u.phone,
      role: u.role,
      status: u.status,
      categoryLabel: u.category_label,
      college: u.college,
      designation: u.designation,
      yearOfPassedOut: u.year_of_passed_out,
      points: Number(u.points) || 0,
      verifiedHours: Number(u.verified_hours) || 0,
      completedActivities: Number(u.completed_activities) || 0,
      consecutiveWeeks: Number(u.consecutive_weeks) || 0,
    }));

    const opportunities = (oppsRes.data || []).map((o) => ({
      id: o.id,
      title: o.title,
      category: o.category,
      location: o.location,
      date: o.date,
      totalSlots: Number(o.total_slots) || 0,
      filledSlots: Number(o.filled_slots) || 0,
      studentsCount: Number(o.students_count) || 0,
      defaultPoints: Number(o.default_points) || 80,
      defaultHours: Number(o.default_hours) || 5,
    }));

    const applications = (appsRes.data || []).map((a) => ({
      id: a.id,
      opportunityId: a.opportunity_id,
      opportunityTitle: a.opportunity_title,
      volunteerName: a.volunteer_name,
      volunteerEmail: a.volunteer_email,
      volunteerRole: a.volunteer_role,
      status: a.status,
    }));

    const activityHistory = (historyRes.data || []).map((h) => ({
      id: h.id,
      volunteerEmail: h.volunteer_email,
      activityTitle: h.activity_title,
      date: h.date,
      hours: Number(h.hours) || 0,
      pointsAwarded: Number(h.points_awarded) || 0,
      note: h.note || "",
    }));

    const ideas = (ideasRes.data || []).map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      college: i.college,
      submittedBy: i.submitted_by,
      date: i.date,
      votes: Number(i.votes) || 0,
      summary: i.summary,
    }));

    const notifications = (notifsRes.data || []).map((n) => ({
      id: n.id,
      message: n.message,
      forRoles: n.for_roles || [],
      recipientEmail: n.recipient_email || undefined,
    }));

    return NextResponse.json(
      {
        users,
        opportunities,
        applications,
        activityHistory,
        ideas,
        notifications,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Supabase GET error:", err);
    return NextResponse.json(
      { error: "Failed to load data from Supabase" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dbUsers = (body.users || []).map((u: Record<string, unknown>) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password ?? null,
      phone: u.phone,
      role: u.role,
      status: u.status,
      category_label: u.categoryLabel ?? null,
      college: u.college ?? null,
      designation: u.designation ?? null,
      year_of_passed_out: u.yearOfPassedOut ?? null,
      points: u.points ?? 0,
      verified_hours: u.verifiedHours ?? 0,
      completed_activities: u.completedActivities ?? 0,
      consecutive_weeks: u.consecutiveWeeks ?? 0,
    }));

    const dbOpps = (body.opportunities || []).map(
      (o: Record<string, unknown>) => ({
        id: o.id,
        title: o.title,
        category: o.category,
        location: o.location,
        date: o.date,
        total_slots: o.totalSlots ?? 0,
        filled_slots: o.filledSlots ?? 0,
        students_count: o.studentsCount ?? 0,
        default_points: o.defaultPoints ?? 80,
        default_hours: o.defaultHours ?? 5,
      })
    );

    const dbApps = (body.applications || []).map(
      (a: Record<string, unknown>) => ({
        id: a.id,
        opportunity_id: a.opportunityId,
        opportunity_title: a.opportunityTitle,
        volunteer_name: a.volunteerName,
        volunteer_email: a.volunteerEmail,
        volunteer_role: a.volunteerRole ?? null,
        status: a.status,
      })
    );

    const dbHistory = (body.activityHistory || []).map(
      (h: Record<string, unknown>) => ({
        id: h.id,
        volunteer_email: h.volunteerEmail,
        activity_title: h.activityTitle,
        date: h.date,
        hours: h.hours ?? 0,
        points_awarded: h.pointsAwarded ?? 0,
        note: h.note ?? "",
      })
    );

    const dbIdeas = (body.ideas || []).map((i: Record<string, unknown>) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      college: i.college,
      submitted_by: i.submittedBy,
      date: i.date,
      votes: i.votes ?? 0,
      summary: i.summary,
    }));

    const dbNotifs = (body.notifications || []).map(
      (n: Record<string, unknown>) => ({
        id: n.id,
        message: n.message,
        for_roles: n.forRoles ?? [],
        recipient_email: n.recipientEmail ?? null,
      })
    );

    if (dbUsers.length) await supabase.from("users").upsert(dbUsers);
    if (dbOpps.length) await supabase.from("opportunities").upsert(dbOpps);
    if (dbApps.length) await supabase.from("applications").upsert(dbApps);
    if (dbHistory.length)
      await supabase.from("activity_history").upsert(dbHistory);
    if (dbIdeas.length) await supabase.from("ideas").upsert(dbIdeas);
    if (dbNotifs.length)
      await supabase.from("notifications").upsert(dbNotifs);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Supabase POST error:", err);
    return NextResponse.json(
      { error: "Failed to save data to Supabase" },
      { status: 500 }
    );
  }
}