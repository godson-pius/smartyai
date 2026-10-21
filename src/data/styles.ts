export interface VideoStyle {
  id: string;
  name: string;
  description: string;
  iconName: string;
  gradient: [string, string];
  promptModifier: string;
}

export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: '35mm film grain, anamorphic lens, dramatic chiaroscuro',
    iconName: 'film-outline',
    gradient: ['#6366F1', '#4F46E5'],
    promptModifier: 'cinematic composition, 35mm film grain, anamorphic lens flare, moody volumetric lighting, ultra-realistic textures',
  },
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Natural documentary lighting and true-to-life details',
    iconName: 'camera-outline',
    gradient: ['#0EA5E9', '#2563EB'],
    promptModifier: 'photorealistic documentary style, natural daylight, candid framing, unedited raw footage feel, crisp 4k detail',
  },
  {
    id: 'movie',
    name: 'Movie',
    description: 'Hollywood blockbuster aesthetic with widescreen flare',
    iconName: 'videocam-outline',
    gradient: ['#8B5CF6', '#7C3AED'],
    promptModifier: 'high-budget Hollywood film look, IMAX color grading, sweeping camera movements, epic production value',
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'High-energy, vibrant colors tailored for TikTok & Reels',
    iconName: 'phone-portrait-outline',
    gradient: ['#EC4899', '#DB2777'],
    promptModifier: 'fast-paced, high saturation, sharp mobile-optimized framing, viral aesthetic, captivating opening hook',
  },
  {
    id: 'fashion',
    name: 'Fashion & Beauty',
    description: 'Editorial Vogue style, elegant runway aesthetics',
    iconName: 'sparkles-outline',
    gradient: ['#F43F5E', '#BE123C'],
    promptModifier: 'high-fashion editorial, soft diffused studio light, glossy textures, avant-garde framing, slow elegant pans',
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Clear, engaging documentary with explanatory visuals',
    iconName: 'school-outline',
    gradient: ['#10B981', '#059669'],
    promptModifier: 'informative documentary style, clean visual demonstrations, clear focal points, well-balanced studio illumination',
  },
  {
    id: 'promotional',
    name: 'Promotional',
    description: 'Polished commercial aesthetic for brands and ads',
    iconName: 'megaphone-outline',
    gradient: ['#F59E0B', '#D97706'],
    promptModifier: 'premium commercial advertising look, product-focused lighting, clean modern environment, dynamic micro-movements',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    description: 'Playful timing, bright vibrant colors and expressive motion',
    iconName: 'happy-outline',
    gradient: ['#F97316', '#EA580C'],
    promptModifier: 'bright high-key lighting, comedic timing cues, expressive kinetic action, warm friendly tones',
  },
  {
    id: 'love-story',
    name: 'Love Story',
    description: 'Golden hour warmth, gentle bokeh, emotional intimacy',
    iconName: 'heart-outline',
    gradient: ['#E11D48', '#BE185D'],
    promptModifier: 'romantic golden hour warmth, soft shallow depth of field, gentle lens blur, emotional cinematic atmosphere',
  },
];
