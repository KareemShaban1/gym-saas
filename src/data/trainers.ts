import { initialMembers } from "./members";

export interface ScheduleSlot {
  day: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  startTime: string;
  endTime: string;
}

export interface CommissionRecord {
  id: number;
  trainerId: number;
  trainerName?: string;
  memberName: string;
  type: "session" | "subscription" | "bonus";
  amount: number;
  date: string;
  status: "paid" | "pending";
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  specialty: string;
  certifications: string[];
  hireDate: string;
  status: "Active" | "On Leave" | "Inactive";
  commissionRate: number; // percentage
  monthlySalary: number;
  schedule: ScheduleSlot[];
  assignedMemberIds: number[];
  bio?: string;
  avatar?: string;
}

export const specialties = [
  "Strength & Conditioning",
  "Weight Loss",
  "Bodybuilding",
  "CrossFit",
  "Yoga & Flexibility",
  "Cardio & Endurance",
  "Functional Training",
  "Rehabilitation",
];

export const weekDays: ScheduleSlot["day"][] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const initialTrainers: Trainer[] = [
  {
    id: 1, name: "Coach Tarek", email: "tarek@gymflow.com", phone: "010-1111-2222",
    gender: "male", specialty: "Strength & Conditioning", certifications: ["NASM CPT", "CSCS"],
    hireDate: "2025-06-01", status: "Active", commissionRate: 15, monthlySalary: 8000,
    schedule: [
      { day: "Sun", startTime: "08:00", endTime: "14:00" },
      { day: "Mon", startTime: "08:00", endTime: "14:00" },
      { day: "Tue", startTime: "08:00", endTime: "14:00" },
      { day: "Wed", startTime: "08:00", endTime: "14:00" },
      { day: "Thu", startTime: "08:00", endTime: "14:00" },
    ],
    assignedMemberIds: [1],
  },
  {
    id: 2, name: "Coach Amira", email: "amira@gymflow.com", phone: "011-3333-4444",
    gender: "female", specialty: "Yoga & Flexibility", certifications: ["RYT 200", "Pilates Mat"],
    hireDate: "2025-08-15", status: "Active", commissionRate: 12, monthlySalary: 7000,
    schedule: [
      { day: "Sun", startTime: "10:00", endTime: "16:00" },
      { day: "Tue", startTime: "10:00", endTime: "16:00" },
      { day: "Thu", startTime: "10:00", endTime: "16:00" },
    ],
    assignedMemberIds: [],
  },
  {
    id: 3, name: "Coach Khaled", email: "khaled@gymflow.com", phone: "012-5555-6666",
    gender: "male", specialty: "Bodybuilding", certifications: ["IFBB Pro Card", "NASM CPT"],
    hireDate: "2025-03-10", status: "Active", commissionRate: 18, monthlySalary: 9000,
    schedule: [
      { day: "Mon", startTime: "14:00", endTime: "21:00" },
      { day: "Wed", startTime: "14:00", endTime: "21:00" },
      { day: "Fri", startTime: "14:00", endTime: "21:00" },
      { day: "Sat", startTime: "10:00", endTime: "16:00" },
    ],
    assignedMemberIds: [3],
  },
  {
    id: 4, name: "Coach Dina", email: "dina@gymflow.com", phone: "010-7777-8888",
    gender: "female", specialty: "Weight Loss", certifications: ["ACE CPT", "Nutrition Coach"],
    hireDate: "2025-09-01", status: "Active", commissionRate: 14, monthlySalary: 7500,
    schedule: [
      { day: "Sun", startTime: "06:00", endTime: "12:00" },
      { day: "Mon", startTime: "06:00", endTime: "12:00" },
      { day: "Wed", startTime: "06:00", endTime: "12:00" },
      { day: "Thu", startTime: "06:00", endTime: "12:00" },
    ],
    assignedMemberIds: [8],
  },
  {
    id: 5, name: "Coach Mahmoud", email: "mahmoud@gymflow.com", phone: "011-9999-0000",
    gender: "male", specialty: "CrossFit", certifications: ["CF-L2", "USAW Sport Performance"],
    hireDate: "2025-04-20", status: "On Leave", commissionRate: 16, monthlySalary: 8500,
    schedule: [
      { day: "Sun", startTime: "15:00", endTime: "21:00" },
      { day: "Tue", startTime: "15:00", endTime: "21:00" },
      { day: "Thu", startTime: "15:00", endTime: "21:00" },
    ],
    assignedMemberIds: [7],
  },
];

export const initialCommissions: CommissionRecord[] = [
  { id: 1, trainerId: 1, memberName: "Ahmed Hassan", type: "session", amount: 150, date: "2026-02-12", status: "pending" },
  { id: 2, trainerId: 1, memberName: "Ahmed Hassan", type: "subscription", amount: 300, date: "2026-02-01", status: "paid" },
  { id: 3, trainerId: 3, memberName: "Mohamed Ali", type: "session", amount: 200, date: "2026-02-11", status: "pending" },
  { id: 4, trainerId: 3, memberName: "Mohamed Ali", type: "subscription", amount: 450, date: "2026-02-01", status: "paid" },
  { id: 5, trainerId: 4, memberName: "Hana Adel", type: "session", amount: 120, date: "2026-02-10", status: "paid" },
  { id: 6, trainerId: 5, memberName: "Omar Farouk", type: "bonus", amount: 500, date: "2026-01-31", status: "paid" },
  { id: 7, trainerId: 1, memberName: "Ahmed Hassan", type: "session", amount: 150, date: "2026-02-08", status: "paid" },
  { id: 8, trainerId: 4, memberName: "Hana Adel", type: "session", amount: 120, date: "2026-02-06", status: "paid" },
];

export const getAssignedMembers = (trainer: Trainer) => {
  return initialMembers.filter((m) => trainer.assignedMemberIds.includes(m.id));
};
