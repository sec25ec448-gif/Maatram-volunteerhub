export type UserRole = "SUPER_ADMIN" | "ADMIN" | "VOLUNTEER";
export type ApprovalStatus = "APPROVED" | "PENDING_APPROVAL" | "REJECTED";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: ApprovalStatus;
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  totalSlots: number;
  filledSlots: number;
}

export interface VolunteerApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  volunteerName: string;
  volunteerEmail: string;
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
  },
  {
    id: "u-2",
    name: "Admin User",
    email: "admin@maatram.org",
    password: "Admin@123",
    phone: "+91 98765 43211",
    role: "ADMIN",
    status: "APPROVED",
  },
  {
    id: "u-3",
    name: "Pending Admin",
    email: "newadmin@maatram.org",
    password: "Admin@123",
    phone: "+91 98765 43212",
    role: "ADMIN",
    status: "PENDING_APPROVAL",
  },
  {
    id: "u-4",
    name: "Karthik Raja",
    email: "karthik@student.edu",
    password: "Volunteer@123",
    phone: "+91 98765 00001",
    role: "VOLUNTEER",
    status: "APPROVED",
  },
  {
    id: "u-5",
    name: "Priya Sundaram",
    email: "priya@alumni.com",
    password: "Volunteer@123",
    phone: "+91 98765 00002",
    role: "VOLUNTEER",
    status: "APPROVED",
  },
  {
    id: "u-6",
    name: "Anitha Ramesh",
    email: "anitha@volunteer.org",
    password: "Volunteer@123",
    phone: "+91 98765 00003",
    role: "VOLUNTEER",
    status: "PENDING_APPROVAL",
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
  },
  {
    id: "opp-2",
    title: "School Digital Literacy Workshop",
    category: "Education",
    location: "Madurai Center",
    date: "2026-12-12",
    totalSlots: 20,
    filledSlots: 12,
  },
];

export const INITIAL_APPLICATIONS: VolunteerApplication[] = [
  {
    id: "app-1",
    opportunityId: "opp-1",
    opportunityTitle: "Weekend Career Mentorship Drive",
    volunteerName: "Karthik Raja",
    volunteerEmail: "karthik@student.edu",
    status: "APPROVED",
  },
  {
    id: "app-2",
    opportunityId: "opp-2",
    opportunityTitle: "School Digital Literacy Workshop",
    volunteerName: "Anitha Ramesh",
    volunteerEmail: "anitha@volunteer.org",
    status: "PENDING",
  },
];