import {
  ArrowRight, ExternalLink, Sparkles, Brain, Globe, Globe2,
  UserPlus, Zap, Eye, Radio, MessageCircle, Cpu, Layers, Shield,
  Network, Monitor, Server, Bot, CheckCircle2, Circle, Clock,
  Menu, X, ArrowUpRight, MessageSquare, FileText, Heart, Lightbulb,
  Database, Cloud, Lock, Star, Award, Gift, Rocket, Users, Camera,
  Music, Gamepad2, ShoppingCart, Palette, Code2, Terminal, Sun, Moon,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  ArrowRight, ExternalLink, Sparkles, Brain, Globe, Globe2,
  UserPlus, Zap, Eye, Radio, MessageCircle, Cpu, Layers, Shield,
  Network, Monitor, Server, Bot, CheckCircle2, Circle, Clock,
  Menu, X, ArrowUpRight, MessageSquare, FileText, Heart, Lightbulb,
  Database, Cloud, Lock, Star, Award, Gift, Rocket, Users, Camera,
  Music, Gamepad2, ShoppingCart, Palette, Code2, Terminal, Sun, Moon,
};

export function getIcon(name: string): LucideIcon {
  const icon = iconMap[name];
  if (!icon) {
    console.warn(`Icon "${name}" not found in icon map, falling back to Sparkles`);
    return Sparkles;
  }
  return icon;
}

export { iconMap };
