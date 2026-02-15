export type MuscleGroup =
  | "Chest" | "Back" | "Shoulders" | "Biceps" | "Triceps"
  | "Legs" | "Glutes" | "Core" | "Cardio" | "Full Body";

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  isGlobal: boolean; // global library vs gym-custom
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  gifUrl?: string;
}

export interface WorkoutExercise {
  exerciseId: number;
  sets: number;
  reps: string; // e.g. "12" or "8-12" or "30s"
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  dayLabel: string; // e.g. "Day 1 - Push"
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: number;
  name: string;
  traineeId: number;
  traineeName: string;
  trainerId?: number;
  trainerName?: string;
  days: WorkoutDay[];
  createdAt: string;
  status: "active" | "completed" | "draft";
}

export interface BodyMeasurement {
  date: string;
  weight: number; // kg
  bodyFat?: number; // %
  chest?: number; // cm
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

export interface ProgressRecord {
  traineeId: number;
  traineeName: string;
  measurements: BodyMeasurement[];
}

export const muscleGroups: MuscleGroup[] = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Glutes", "Core", "Cardio", "Full Body",
];

export const initialExercises: Exercise[] = [
  { id: 1, name: "Barbell Bench Press", muscleGroup: "Chest", equipment: "Barbell", isGlobal: true, description: "Flat bench press targeting the chest." },
  { id: 2, name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbells", isGlobal: true },
  { id: 3, name: "Cable Flyes", muscleGroup: "Chest", equipment: "Cable Machine", isGlobal: true },
  { id: 4, name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", isGlobal: true, description: "Compound lift for posterior chain." },
  { id: 5, name: "Pull-Ups", muscleGroup: "Back", equipment: "Pull-up Bar", isGlobal: true },
  { id: 6, name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable Machine", isGlobal: true },
  { id: 7, name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable Machine", isGlobal: true },
  { id: 8, name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", isGlobal: true },
  { id: 9, name: "Lateral Raises", muscleGroup: "Shoulders", equipment: "Dumbbells", isGlobal: true },
  { id: 10, name: "Face Pulls", muscleGroup: "Shoulders", equipment: "Cable Machine", isGlobal: true },
  { id: 11, name: "Barbell Curl", muscleGroup: "Biceps", equipment: "Barbell", isGlobal: true },
  { id: 12, name: "Hammer Curls", muscleGroup: "Biceps", equipment: "Dumbbells", isGlobal: true },
  { id: 13, name: "Tricep Pushdown", muscleGroup: "Triceps", equipment: "Cable Machine", isGlobal: true },
  { id: 14, name: "Skull Crushers", muscleGroup: "Triceps", equipment: "EZ Bar", isGlobal: true },
  { id: 15, name: "Barbell Squat", muscleGroup: "Legs", equipment: "Barbell", isGlobal: true, description: "King of leg exercises." },
  { id: 16, name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", isGlobal: true },
  { id: 17, name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell", isGlobal: true },
  { id: 18, name: "Leg Curl", muscleGroup: "Legs", equipment: "Machine", isGlobal: true },
  { id: 19, name: "Hip Thrust", muscleGroup: "Glutes", equipment: "Barbell", isGlobal: true },
  { id: 20, name: "Bulgarian Split Squat", muscleGroup: "Glutes", equipment: "Dumbbells", isGlobal: true },
  { id: 21, name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", isGlobal: true },
  { id: 22, name: "Hanging Leg Raise", muscleGroup: "Core", equipment: "Pull-up Bar", isGlobal: true },
  { id: 23, name: "Cable Woodchop", muscleGroup: "Core", equipment: "Cable Machine", isGlobal: true },
  { id: 24, name: "Treadmill Run", muscleGroup: "Cardio", equipment: "Treadmill", isGlobal: true },
  { id: 25, name: "Rowing Machine", muscleGroup: "Cardio", equipment: "Rower", isGlobal: true },
  { id: 26, name: "Battle Ropes", muscleGroup: "Cardio", equipment: "Ropes", isGlobal: false },
  { id: 27, name: "Box Jumps", muscleGroup: "Full Body", equipment: "Plyo Box", isGlobal: false },
];

export const initialWorkoutPlans: WorkoutPlan[] = [
  {
    id: 1, name: "Push/Pull/Legs Split", traineeId: 1, traineeName: "Ahmed Hassan",
    trainerId: 1, trainerName: "Coach Tarek", status: "active", createdAt: "2026-02-01",
    days: [
      {
        dayLabel: "Day 1 – Push",
        exercises: [
          { exerciseId: 1, sets: 4, reps: "8-10", restSeconds: 90 },
          { exerciseId: 2, sets: 3, reps: "10-12", restSeconds: 60 },
          { exerciseId: 3, sets: 3, reps: "12-15", restSeconds: 60 },
          { exerciseId: 8, sets: 4, reps: "8-10", restSeconds: 90 },
          { exerciseId: 13, sets: 3, reps: "12-15", restSeconds: 45 },
        ],
      },
      {
        dayLabel: "Day 2 – Pull",
        exercises: [
          { exerciseId: 4, sets: 4, reps: "5-6", restSeconds: 120 },
          { exerciseId: 5, sets: 3, reps: "8-10", restSeconds: 90 },
          { exerciseId: 6, sets: 3, reps: "10-12", restSeconds: 60 },
          { exerciseId: 10, sets: 3, reps: "15", restSeconds: 45 },
          { exerciseId: 11, sets: 3, reps: "10-12", restSeconds: 60 },
        ],
      },
      {
        dayLabel: "Day 3 – Legs",
        exercises: [
          { exerciseId: 15, sets: 4, reps: "6-8", restSeconds: 120 },
          { exerciseId: 16, sets: 3, reps: "10-12", restSeconds: 90 },
          { exerciseId: 17, sets: 3, reps: "10-12", restSeconds: 90 },
          { exerciseId: 19, sets: 3, reps: "12", restSeconds: 60 },
          { exerciseId: 22, sets: 3, reps: "15", restSeconds: 45 },
        ],
      },
    ],
  },
  {
    id: 2, name: "Full Body Basics", traineeId: 3, traineeName: "Mohamed Ali",
    trainerId: 3, trainerName: "Coach Khaled", status: "active", createdAt: "2026-02-05",
    days: [
      {
        dayLabel: "Day A",
        exercises: [
          { exerciseId: 15, sets: 4, reps: "8", restSeconds: 120 },
          { exerciseId: 1, sets: 4, reps: "8", restSeconds: 90 },
          { exerciseId: 5, sets: 3, reps: "max", restSeconds: 90 },
          { exerciseId: 21, sets: 3, reps: "60s", restSeconds: 30 },
        ],
      },
      {
        dayLabel: "Day B",
        exercises: [
          { exerciseId: 4, sets: 4, reps: "5", restSeconds: 120 },
          { exerciseId: 8, sets: 4, reps: "8", restSeconds: 90 },
          { exerciseId: 7, sets: 3, reps: "10", restSeconds: 60 },
          { exerciseId: 24, sets: 1, reps: "20min", restSeconds: 0 },
        ],
      },
    ],
  },
  {
    id: 3, name: "Weight Loss Program", traineeId: 8, traineeName: "Hana Adel",
    trainerId: 4, trainerName: "Coach Dina", status: "draft", createdAt: "2026-02-10",
    days: [
      {
        dayLabel: "Circuit Day",
        exercises: [
          { exerciseId: 27, sets: 3, reps: "10", restSeconds: 30 },
          { exerciseId: 20, sets: 3, reps: "12 each", restSeconds: 30 },
          { exerciseId: 26, sets: 3, reps: "30s", restSeconds: 30 },
          { exerciseId: 21, sets: 3, reps: "45s", restSeconds: 15 },
          { exerciseId: 25, sets: 1, reps: "10min", restSeconds: 0 },
        ],
      },
    ],
  },
];

export const initialProgress: ProgressRecord[] = [
  {
    traineeId: 1, traineeName: "Ahmed Hassan",
    measurements: [
      { date: "2026-01-15", weight: 88, bodyFat: 22, chest: 102, waist: 90, hips: 100, arms: 36, thighs: 60 },
      { date: "2026-01-29", weight: 86.5, bodyFat: 21, chest: 103, waist: 88, hips: 99, arms: 36.5, thighs: 60 },
      { date: "2026-02-12", weight: 85, bodyFat: 19.5, chest: 104, waist: 86, hips: 98, arms: 37, thighs: 61 },
    ],
  },
  {
    traineeId: 3, traineeName: "Mohamed Ali",
    measurements: [
      { date: "2026-02-01", weight: 75, bodyFat: 16, chest: 96, waist: 80, arms: 33, thighs: 55 },
      { date: "2026-02-12", weight: 76, bodyFat: 15.5, chest: 97, waist: 79, arms: 33.5, thighs: 56 },
    ],
  },
  {
    traineeId: 8, traineeName: "Hana Adel",
    measurements: [
      { date: "2026-02-05", weight: 70, bodyFat: 28, waist: 78, hips: 100, thighs: 58 },
    ],
  },
];

export const getExerciseById = (id: number) => initialExercises.find((e) => e.id === id);
