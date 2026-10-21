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
    videoLimit: '3 videos / month',
    maxDurationSeconds: 20,
    maxDurationLabel: 'Up to 20 sec',
    resolution: '720p HD',
    isPopular: false,
    features: [
      '3 AI videos per month',
      'Up to 20 seconds length',
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
    videoLimit: '8 videos / month',
    maxDurationSeconds: 60,
    maxDurationLabel: 'Up to 1 minute',
    resolution: '1080p Full HD',
    isPopular: true,
    features: [
      '8 AI videos per month',
      'Up to 1 minute duration',
      'Crisp 1080p Full HD',
      'Faster 2x generation speed',
      'Advanced accents & voices',
      'All 9 cinematic styles',
      'Collapsible camera controls',
    ],
    ctaLabel: 'Choose Pro',
  },
  {
    id: 'Premium',
    name: 'Premium',
    priceMonthly: 40,
    priceAnnualMonthly: 32,
    videoLimit: '15 videos / month',
    maxDurationSeconds: 120,
    maxDurationLabel: 'Up to 2 minutes',
    resolution: '1080p Full HD',
    isPopular: false,
    features: [
      '15 AI videos per month',
      'Up to 2 minutes duration',
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
    id: '20s',
    seconds: 20,
    label: '20 sec',
    description: 'Quick hook, ideal for reels and ads',
    minPlan: 'Basic',
    creditCost: 15,
  },
  {
    id: '1m',
    seconds: 60,
    label: '1 min',
    description: 'Storytelling & standard social post',
    minPlan: 'Pro',
    creditCost: 25,
  },
  {
    id: '2m',
    seconds: 120,
    label: '2 min',
    description: 'Deep dive narrative & mini-movie',
    minPlan: 'Premium',
    creditCost: 45,
  },
];
