import {
  Award,
  BookOpen,
  Bot,
  Brain,
  Flame,
  Heart,
  LayoutDashboard,
  Map,
  MessagesSquare,
  NotebookPen,
  PiggyBank,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TimerReset,
  Users,
  Wallet,
} from "lucide-react";
import { createElement } from "react";

export const tabItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "overview", label: "Quest Hub", icon: Map },
  { id: "courses", label: "Courses", icon: Brain },
  { id: "stories", label: "Stories", icon: BookOpen },
  { id: "coach", label: "Coach", icon: Bot },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "family", label: "Family Hub", icon: Users },
];

export const moodOptions = ["proud", "curious", "steady", "grateful", "wobbly"];

const trackIcons = {
  academics: Brain,
  literacy: BookOpen,
  confidence: Heart,
  money: Wallet,
  relationships: MessagesSquare,
  digital: ShieldCheck,
  habits: TimerReset,
  body: ShieldCheck,
};

const goalIcons = {
  confidence: Heart,
  friendships: Users,
  money: PiggyBank,
  reading: BookOpen,
  focus: Target,
  digital: ShieldCheck,
};

const badgeIcons = {
  spark: Sparkles,
  rocket: Rocket,
  story: BookOpen,
  heart: Heart,
  flame: Flame,
  award: Award,
  shield: ShieldCheck,
};

export function TrackGlyph({ category, size = 18 }) {
  const Icon = trackIcons[category] ?? Sparkles;
  return createElement(Icon, { size });
}

export function GoalGlyph({ goalId, size = 18 }) {
  const Icon = goalIcons[goalId] ?? Sparkles;
  return createElement(Icon, { size });
}

export function BadgeGlyph({ iconKey, size = 18 }) {
  const Icon = badgeIcons[iconKey] ?? Star;
  return createElement(Icon, { size });
}
