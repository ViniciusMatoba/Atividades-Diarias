import {
  Globe2,
  MapPin,
  Sparkles,
  Grid3x3,
  ArrowDownUp,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Globe2,
  MapPin,
  Sparkles,
  Grid3x3,
  ArrowDownUp,
};

interface GameIconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Resolve o nome de ícone (desacoplado no GameMeta) para o componente lucide. */
export function GameIcon({ name, size = 22, className }: GameIconProps) {
  const Icon = ICONS[name] ?? Gamepad2;
  return <Icon size={size} className={className} aria-hidden />;
}
