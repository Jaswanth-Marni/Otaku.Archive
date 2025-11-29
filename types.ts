export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureTag {
  label: string;
  position: string; // Tailwind class for absolute positioning
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}