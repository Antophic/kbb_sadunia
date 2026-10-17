import {
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Images,
  Landmark,
  Lightbulb,
  Newspaper,
  PenLine,
  Scale,
  Users,
} from "lucide-react";

const ICONS = {
  bookOpen: BookOpen,
  calendarDays: CalendarDays,
  heartHandshake: HeartHandshake,
  images: Images,
  landmark: Landmark,
  lightbulb: Lightbulb,
  newspaper: Newspaper,
  penLine: PenLine,
  scale: Scale,
  users: Users,
};

export default function OrgIcon({ className = "", name, size = 24 }) {
  const Icon = ICONS[name] || Users;
  return <Icon aria-hidden="true" className={className} size={size} />;
}
