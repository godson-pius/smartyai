export interface VideoItem {
  id: string;
  title: string;
  prompt: string;
  duration: string;
  durationSeconds: number;
  date: string;
  createdAt: number;
  status: 'completed' | 'processing' | 'failed';
  thumbnailUrl: string;
  style: string;
  styleId: string;
  voice: string;
  language: string;
  aspectRatio: string;
  camera: string;
  resolution: string;
  fileSize: string;
  creditsUsed: number;
  failureReason?: string;
}

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-01',
    title: 'Kigali Sunset Innovation',
    prompt: 'A cinematic scene of a young African entrepreneur walking through Kigali at sunset, golden hour warm lighting, bustling modern boulevard.',
    duration: '1:00',
    durationSeconds: 60,
    date: 'Today, 10:45 AM',
    createdAt: Date.now() - 3600000 * 2,
    status: 'completed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80',
    style: 'Cinematic',
    styleId: 'cinematic',
    voice: 'Female narration',
    language: 'African English',
    aspectRatio: '16:9',
    camera: 'Cinematic tracking shot',
    resolution: '1080p FHD',
    fileSize: '34.2 MB',
    creditsUsed: 25,
  },
  {
    id: 'vid-02',
    title: 'Cyberpunk Neon Alleyways',
    prompt: 'Hyper-detailed futuristic cyberpunk alley in Tokyo during heavy rain with holographic neon signs reflecting on puddles.',
    duration: '0:20',
    durationSeconds: 20,
    date: 'Yesterday, 8:20 PM',
    createdAt: Date.now() - 3600000 * 18,
    status: 'completed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    style: 'Movie',
    styleId: 'movie',
    voice: 'Male narration',
    language: 'US English',
    aspectRatio: '9:16',
    camera: 'Wide shot',
    resolution: '1080p FHD',
    fileSize: '16.8 MB',
    creditsUsed: 15,
  },
  {
    id: 'vid-03',
    title: 'Minimalist Fashion Editorial',
    prompt: 'High-fashion editorial runway spotlight with flowing sand-colored linen fabrics and gentle wind machine motion.',
    duration: '1:00',
    durationSeconds: 60,
    date: 'Oct 1, 2026',
    createdAt: Date.now() - 3600000 * 40,
    status: 'completed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    style: 'Fashion & Beauty',
    styleId: 'fashion',
    voice: 'No Voice (Score only)',
    language: 'English',
    aspectRatio: '9:16',
    camera: 'Slow motion glide',
    resolution: '1080p FHD',
    fileSize: '31.5 MB',
    creditsUsed: 25,
  },
  {
    id: 'vid-04',
    title: 'Serengeti Migration Aerial',
    prompt: 'Drone shot soaring over vast golden savanna grasslands during wildlife migration in morning mist.',
    duration: '2:00',
    durationSeconds: 120,
    date: 'Sep 29, 2026',
    createdAt: Date.now() - 3600000 * 80,
    status: 'completed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80',
    style: 'Realistic',
    styleId: 'realistic',
    voice: 'Male narration',
    language: 'UK English',
    aspectRatio: '16:9',
    camera: 'Drone Aerial',
    resolution: '1080p FHD',
    fileSize: '62.4 MB',
    creditsUsed: 45,
  },
  {
    id: 'vid-05',
    title: 'Deep Ocean Bioluminescence',
    prompt: 'Deep sea exploration camera discovering glowing ethereal jellyfish in pitch-black abyss.',
    duration: '1:00',
    durationSeconds: 60,
    date: 'Sep 26, 2026',
    createdAt: Date.now() - 3600000 * 120,
    status: 'failed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    style: 'Cinematic',
    styleId: 'cinematic',
    voice: 'Female narration',
    language: 'US English',
    aspectRatio: '16:9',
    camera: 'Close-up',
    resolution: '1080p FHD',
    fileSize: '0 MB',
    creditsUsed: 0,
    failureReason: 'GPU rendering cluster timeout. Credits were refunded.',
  },
];
