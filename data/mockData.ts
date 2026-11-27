export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STUDENT_VOLUNTEER"
  | "ALUMNI_VOLUNTEER";

export type ApprovalStatus = "APPROVED" | "PENDING_APPROVAL" | "REJECTED";

export interface VolunteerActivityRecord {
  id: string;
  volunteerEmail: string;
  activityTitle: string;
  date: string;
  hours: number;
  pointsAwarded: number;
  note: string;
}

export interface VolunteerIdea {
  id: string;
  title: string;
  category: string;
  college: string;
  submittedBy: string;
  date: string;
  votes: number;
  summary: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  status: ApprovalStatus;
  categoryLabel?: string;
  college?: string;
  designation?: string;
  yearOfPassedOut?: string;
  points: number;
  verifiedHours: number;
  completedActivities: number;
  consecutiveWeeks?: number;
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  totalSlots: number;
  filledSlots: number;
  studentsCount: number;
  defaultPoints?: number;
  defaultHours?: number;
}

export interface VolunteerApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerRole?: UserRole;
  status: "PENDING" | "APPROVED" | "DECLINED";
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "u-1",
    name: "Super Admin User",
    email: "superadmin@maatram.org",
    password: "Super@123",
    phone: "+91 98765 43210",
    role: "SUPER_ADMIN",
    status: "APPROVED",
    categoryLabel: "Leadership",
    points: 0,
    verifiedHours: 0,
    completedActivities: 0,
  },
  {
    id: "u-2",
    name: "Admin User",
    email: "admin@maatram.org",
    password: "Admin@123",
    phone: "+91 98765 43211",
    role: "ADMIN",
    status: "APPROVED",
    categoryLabel: "Coordinator",
    points: 0,
    verifiedHours: 0,
    completedActivities: 0,
  },
  {
    id: "u-3",
    name: "Pending Admin",
    email: "newadmin@maatram.org",
    password: "Admin@123",
    phone: "+91 98765 43212",
    role: "ADMIN",
    status: "PENDING_APPROVAL",
    categoryLabel: "Coordinator",
    points: 0,
    verifiedHours: 0,
    completedActivities: 0,
  },
  {
    id: "u-4",
    name: "Karthik Raja",
    email: "karthik@student.edu",
    password: "Volunteer@123",
    phone: "+91 98765 00001",
    role: "STUDENT_VOLUNTEER",
    status: "APPROVED",
    categoryLabel: "Student Volunteer",
    college: "College of Engineering, Guindy",
    yearOfPassedOut: "2027",
    points: 340,
    verifiedHours: 24,
    completedActivities: 4,
    consecutiveWeeks: 3,
  },
  {
    id: "u-5",
    name: "Priya Sundaram",
    email: "priya@alumni.com",
    password: "Volunteer@123",
    phone: "+91 98765 00002",
    role: "ALUMNI_VOLUNTEER",
    status: "APPROVED",
    categoryLabel: "Alumni Volunteer",
    college: "College of Engineering, Guindy",
    designation: "Senior Software Engineer",
    yearOfPassedOut: "2022",
    points: 520,
    verifiedHours: 36,
    completedActivities: 7,
    consecutiveWeeks: 4,
  },
  {
    id: "u-6",
    name: "Anitha Ramesh",
    email: "anitha@volunteer.org",
    password: "Volunteer@123",
    phone: "+91 98765 00003",
    role: "STUDENT_VOLUNTEER",
    status: "PENDING_APPROVAL",
    categoryLabel: "Student Volunteer",
    college: "SSN College of Engineering",
    yearOfPassedOut: "2028",
    points: 110,
    verifiedHours: 8,
    completedActivities: 1,
    consecutiveWeeks: 1,
  },
  {
    id: "u-7",
    name: "Vikram Selvam",
    email: "vikram@ssn.edu",
    password: "Volunteer@123",
    phone: "+91 98765 00004",
    role: "STUDENT_VOLUNTEER",
    status: "APPROVED",
    categoryLabel: "Student Volunteer",
    college: "SSN College of Engineering",
    yearOfPassedOut: "2027",
    points: 260,
    verifiedHours: 18,
    completedActivities: 3,
    consecutiveWeeks: 2,
  },
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    title: "Weekend Career Mentorship Drive",
    category: "Mentorship",
    location: "Chennai Hub",
    date: "2026-12-05",
    totalSlots: 25,
    filledSlots: 18,
    studentsCount: 14,
    defaultPoints: 100,
    defaultHours: 6,
  },
  {
    id: "opp-2",
    title: "School Digital Literacy Workshop",
    category: "Education",
    location: "Madurai Center",
    date: "2026-12-12",
    totalSlots: 20,
    filledSlots: 12,
    studentsCount: 9,
    defaultPoints: 80,
    defaultHours: 5,
  },
];

export const INITIAL_APPLICATIONS: VolunteerApplication[] = [
  {
    id: "app-1",
    opportunityId: "opp-1",
    opportunityTitle: "Weekend Career Mentorship Drive",
    volunteerName: "Karthik Raja",
    volunteerEmail: "karthik@student.edu",
    volunteerRole: "STUDENT_VOLUNTEER",
    status: "APPROVED",
  },
  {
    id: "app-2",
    opportunityId: "opp-2",
    opportunityTitle: "School Digital Literacy Workshop",
    volunteerName: "Anitha Ramesh",
    volunteerEmail: "anitha@volunteer.org",
    volunteerRole: "STUDENT_VOLUNTEER",
    status: "PENDING",
  },
];

export const INITIAL_ACTIVITY_HISTORY: VolunteerActivityRecord[] = [
  {
    id: "act-1",
    volunteerEmail: "priya@alumni.com",
    activityTitle: "Alumni Career Guidance Session",
    date: "2026-11-08",
    hours: 12,
    pointsAwarded: 220,
    note: "Verified mentorship session & feedback review",
  },
  {
    id: "act-2",
    volunteerEmail: "karthik@student.edu",
    activityTitle: "Weekend Career Mentorship Drive",
    date: "2026-11-14",
    hours: 8,
    pointsAwarded: 140,
    note: "Student coordination & session support",
  },
];

export const INITIAL_IDEAS: VolunteerIdea[] = [
  {
    id: "idea-1",
    title: "Sunday Coding & Resume Clinic for First-Gen Students",
    category: "Mentorship",
    college: "College of Engineering, Guindy",
    submittedBy: "Karthik Raja",
    date: "2026-11-18",
    votes: 24,
    summary: "Weekly peer + alumni mock interviews and GitHub portfolio reviews.",
  },
  {
    id: "idea-2",
    title: "Tamil STEM Lab Kits for Rural Middle Schools",
    category: "Education",
    college: "SSN College of Engineering",
    submittedBy: "Vikram Selvam",
    date: "2026-11-21",
    votes: 19,
    summary:
      "Low-cost hands-on science and digital basics kits built by student clubs.",
  },
  {
    id: "idea-3",
    title: "Alumni Industry Panel & Scholarship Readiness Bootcamp",
    category: "Career Guidance",
    college: "College of Engineering, Guindy",
    submittedBy: "Priya Sundaram",
    date: "2026-11-24",
    votes: 31,
    summary:
      "Monthly alumni sessions guiding students on internships and higher studies.",
  },
];