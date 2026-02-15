import { Dumbbell, Users, CreditCard, BarChart3, QrCode, Globe, Shield, Zap } from "lucide-react";

export const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Track trainees, assign personal trainers, and manage subscriptions with ease.",
  },
  {
    icon: Dumbbell,
    title: "Workout Programs",
    description: "Create exercise libraries and personalized workout tables for every trainee.",
  },
  {
    icon: CreditCard,
    title: "Flexible Billing",
    description: "Monthly plans, coin-based sessions, and bundled packages — your way.",
  },
  {
    icon: QrCode,
    title: "QR Attendance",
    description: "Fast check-ins with QR codes. Track every session automatically.",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description: "Revenue, expenses, trainer commissions — all in real-time dashboards.",
  },
  {
    icon: Globe,
    title: "Arabic & English",
    description: "Full RTL support. Serve your members in their preferred language.",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Security",
    description: "Each gym's data is fully isolated. Enterprise-grade security built in.",
  },
  {
    icon: Zap,
    title: "Smart Reminders",
    description: "Auto-notify members before subscriptions expire. Reduce churn effortlessly.",
  },
];

export const pricingPlans = [
  {
    name: "Basic",
    price: "499",
    currency: "EGP",
    period: "/month",
    description: "Perfect for small gyms getting started",
    features: [
      "Up to 100 members",
      "1 branch",
      "Basic attendance tracking",
      "Monthly reports",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "999",
    currency: "EGP",
    period: "/month",
    description: "For growing gyms that need more power",
    features: [
      "Up to 500 members",
      "3 branches",
      "QR code attendance",
      "Workout programs",
      "Financial reports",
      "Priority support",
      "Trainer management",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "1,999",
    currency: "EGP",
    period: "/month",
    description: "Unlimited power for gym chains",
    features: [
      "Unlimited members",
      "Unlimited branches",
      "All Pro features",
      "API access",
      "Custom branding",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    highlighted: false,
  },
];

export const stats = [
  { value: "500+", label: "Gyms Registered" },
  { value: "50K+", label: "Active Members" },
  { value: "1M+", label: "Check-ins Tracked" },
  { value: "99.9%", label: "Uptime" },
];
