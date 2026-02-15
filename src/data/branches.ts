import { initialTrainers } from "./trainers";

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  managerId: number | null;
  trainerIds: number[];
  status: "Active" | "Under Maintenance" | "Closed";
  openingHours: string;
  capacity: number;
  currentMembers: number;
  monthlyRevenue: number;
  facilities: string[];
  openedDate: string;
}

export const facilities = [
  "Weights Area",
  "Cardio Zone",
  "Swimming Pool",
  "Sauna",
  "Group Classes",
  "Boxing Ring",
  "CrossFit Zone",
  "Yoga Studio",
  "Locker Rooms",
  "Parking",
  "Juice Bar",
  "Kids Area",
];

export const egyptianCities = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Mansoura",
  "Tanta",
  "6th of October",
  "New Cairo",
  "Sheikh Zayed",
];

export const initialBranches: Branch[] = [
  {
    id: 1,
    name: "GymFlow Maadi",
    address: "15 Road 9, Maadi",
    city: "Cairo",
    phone: "02-2378-5500",
    email: "maadi@gymflow.com",
    managerId: 1,
    trainerIds: [1, 4],
    status: "Active",
    openingHours: "6:00 AM – 11:00 PM",
    capacity: 200,
    currentMembers: 156,
    monthlyRevenue: 185000,
    facilities: ["Weights Area", "Cardio Zone", "Sauna", "Group Classes", "Locker Rooms", "Parking"],
    openedDate: "2024-01-15",
  },
  {
    id: 2,
    name: "GymFlow Heliopolis",
    address: "22 Merghany St, Heliopolis",
    city: "Cairo",
    phone: "02-2690-1100",
    email: "heliopolis@gymflow.com",
    managerId: 3,
    trainerIds: [2, 3],
    status: "Active",
    openingHours: "5:30 AM – 11:30 PM",
    capacity: 250,
    currentMembers: 210,
    monthlyRevenue: 245000,
    facilities: ["Weights Area", "Cardio Zone", "Swimming Pool", "Sauna", "Group Classes", "Yoga Studio", "Locker Rooms", "Juice Bar"],
    openedDate: "2023-08-01",
  },
  {
    id: 3,
    name: "GymFlow New Cairo",
    address: "Cairo Festival City Mall, Ring Road",
    city: "New Cairo",
    phone: "02-2614-3300",
    email: "newcairo@gymflow.com",
    managerId: null,
    trainerIds: [5],
    status: "Active",
    openingHours: "6:00 AM – 12:00 AM",
    capacity: 300,
    currentMembers: 178,
    monthlyRevenue: 210000,
    facilities: ["Weights Area", "Cardio Zone", "CrossFit Zone", "Boxing Ring", "Group Classes", "Locker Rooms", "Parking", "Kids Area"],
    openedDate: "2025-03-10",
  },
  {
    id: 4,
    name: "GymFlow Sheikh Zayed",
    address: "Arkan Plaza, 26th of July Corridor",
    city: "Sheikh Zayed",
    phone: "02-3851-7700",
    email: "zayed@gymflow.com",
    managerId: null,
    trainerIds: [],
    status: "Under Maintenance",
    openingHours: "7:00 AM – 10:00 PM",
    capacity: 180,
    currentMembers: 0,
    monthlyRevenue: 0,
    facilities: ["Weights Area", "Cardio Zone", "Locker Rooms"],
    openedDate: "2026-04-01",
  },
];

export const getBranchTrainers = (branch: Branch) =>
  initialTrainers.filter((t) => branch.trainerIds.includes(t.id));

export const getBranchManager = (branch: Branch) =>
  branch.managerId ? initialTrainers.find((t) => t.id === branch.managerId) ?? null : null;
