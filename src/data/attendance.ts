import { initialMembers, Member } from "./members";

export interface AttendanceRecord {
  id: number;
  memberId: number;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  method: "qr" | "manual";
  coinDeducted?: boolean;
}

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

export const initialAttendance: AttendanceRecord[] = [
  { id: 1, memberId: 1, memberName: "Ahmed Hassan", checkInTime: `${today}T06:15:00`, checkOutTime: `${today}T07:45:00`, method: "qr" },
  { id: 2, memberId: 3, memberName: "Mohamed Ali", checkInTime: `${today}T07:00:00`, checkOutTime: `${today}T08:30:00`, method: "qr" },
  { id: 3, memberId: 5, memberName: "Youssef Kamal", checkInTime: `${today}T08:20:00`, method: "manual", coinDeducted: true },
  { id: 4, memberId: 7, memberName: "Omar Farouk", checkInTime: `${today}T09:10:00`, method: "qr" },
  { id: 5, memberId: 8, memberName: "Hana Adel", checkInTime: `${today}T10:00:00`, checkOutTime: `${today}T11:15:00`, method: "manual" },
  { id: 6, memberId: 2, memberName: "Sara Ibrahim", checkInTime: `${today}T16:30:00`, method: "qr", coinDeducted: true },
  { id: 7, memberId: 1, memberName: "Ahmed Hassan", checkInTime: `${yesterday}T06:00:00`, checkOutTime: `${yesterday}T07:30:00`, method: "qr" },
  { id: 8, memberId: 3, memberName: "Mohamed Ali", checkInTime: `${yesterday}T07:15:00`, checkOutTime: `${yesterday}T08:45:00`, method: "qr" },
  { id: 9, memberId: 4, memberName: "Nour Elsayed", checkInTime: `${yesterday}T17:00:00`, checkOutTime: `${yesterday}T18:20:00`, method: "manual" },
  { id: 10, memberId: 7, memberName: "Omar Farouk", checkInTime: `${yesterday}T18:30:00`, checkOutTime: `${yesterday}T20:00:00`, method: "qr" },
];
