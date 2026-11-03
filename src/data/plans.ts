export type PlanTier = 'Basic' | 'Pro' | 'Premium';

export interface Plan {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  videoLimit: string;
  maxDurationSeconds: number;
  maxDurationLabel: string;
  resolution: string;
  isPopular?: boolean;
  features: string[];
  ctaLabel: string;
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'Basic',
    name: 'Basic',
    priceMonthly: 7,
    priceAnnualMonthly: 5,
    videoLimit: '5 videos / month',
    maxDurationSeconds: 10,
    maxDurationLabel: 'Up to 10 sec',
    resolution: '720p HD',
    isPopular: false,
    features: [
      '5 AI video shots per month',
      'Up to 10 seconds length',
      'Standard 720p resolution',
      'Standard generation queue',
      'Access to core video styles',
      'Standard voice narration',
    ],
    ctaLabel: 'Choose Basic',
  },
  {
    id: 'Pro',
    name: 'Pro',
    priceMonthly: 20,
    priceAnnualMonthly: 16,
    videoLimit: '15 videos / month',
    maxDurationSeconds: 15,
    maxDurationLabel: 'Up to 15 sec',
    resolution: '1080p Full HD',
    isPopular: true,
    features: [
      '15 AI video shots per month',
      'Up to 15 seconds duration',
      'Crisp 1080p Full HD',
      'Faster 2x generation speed',
      'Advanced accents & voices',
      'All 9 cinematic styles',
      'Scene-by-scene script director',
    ],
    ctaLabel: 'Choose Pro',
  },
  {
    id: 'Premium',
    name: 'Premium',
    priceMonthly: 40,
    priceAnnualMonthly: 32,
    videoLimit: '35 videos / month',
    maxDurationSeconds: 15,
    maxDurationLabel: '15s + Multi-Scene',
    resolution: '1080p Full HD',
    isPopular: false,
    features: [
      '35 AI video shots per month',
      'Full Multi-Scene Storyboard Studio',
      'Priority VIP generation pipeline',
      'Highest quality 1080p render',
      'All voices & dialects included',
      'Advanced sound effects & audio',
      'Commercial usage license',
    ],
    ctaLabel: 'Choose Premium',
  },
];

export interface VideoDurationOption {
  id: string;
  seconds: number;
  label: string;
  description: string;
  minPlan: PlanTier;
  creditCost: number;
}

export const DURATION_OPTIONS: VideoDurationOption[] = [
  {
    id: '5s',
    seconds: 5,
    label: '5 sec',
    description: 'High-energy hook, ideal for reels & b-roll',
    minPlan: 'Basic',
    creditCost: 10,
  },
  {
    id: '10s',
    seconds: 10,
    label: '10 sec',
    description: 'Standard cinematic AI diffusion scene',
    minPlan: 'Basic',
    creditCost: 20,
  },
  {
    id: '15s',
    seconds: 15,
    label: '15 sec',
    description: 'Extended scene beat with rich camera pacing',
    minPlan: 'Pro',
    creditCost: 30,
  },
];
