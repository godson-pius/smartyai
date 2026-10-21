export interface CameraOption {
  id: string;
  name: string;
  icon: string;
}

export const CAMERA_STYLES: CameraOption[] = [
  { id: 'cinematic', name: 'Cinematic', icon: 'videocam-outline' },
  { id: 'close-up', name: 'Close-up', icon: 'scan-outline' },
  { id: 'wide-shot', name: 'Wide Shot', icon: 'expand-outline' },
  { id: 'handheld', name: 'Handheld', icon: 'hand-left-outline' },
  { id: 'drone', name: 'Drone Aerial', icon: 'airplane-outline' },
  { id: 'tracking', name: 'Tracking Shot', icon: 'navigate-outline' },
];

export interface AspectRatioOption {
  id: string;
  ratio: string;
  label: string;
  sublabel: string;
  icon: string;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: '16:9', ratio: '16:9', label: '16:9 Landscape', sublabel: 'YouTube, TV, Desktop', icon: 'tablet-landscape-outline' },
  { id: '9:16', ratio: '9:16', label: '9:16 Portrait', sublabel: 'TikTok, Reels, Shorts', icon: 'phone-portrait-outline' },
  { id: '1:1', ratio: '1:1', label: '1:1 Square', sublabel: 'Instagram Feed, Ads', icon: 'square-outline' },
];

export const MOOD_OPTIONS = [
  { id: 'inspiring', label: 'Inspiring' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'playful', label: 'Playful' },
  { id: 'calm', label: 'Calm' },
  { id: 'mysterious', label: 'Mysterious' },
  { id: 'energetic', label: 'Energetic' },
];

export const PROMPT_SUGGESTIONS = [
  'A cinematic scene of a young African entrepreneur walking through Kigali at sunset, golden hour light, bustling city backdrop.',
  'A tranquil Japanese bamboo grove during morning mist, slow camera pan, ambient nature sound and calm atmosphere.',
  'Futuristic neon-lit street market in 2085 with cybernetic vendors and rainy reflections on asphalt.',
  'High-fashion runway model gliding under dramatic spotlight with flowing silk garments and electronic rhythm.',
  'Documentary view of artisan coffee brewing, steam rising in macro close-up with rich warm tones.',
];
