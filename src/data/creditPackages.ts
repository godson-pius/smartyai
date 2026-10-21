export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits?: number;
  badge?: string;
  description: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 5,
    description: 'Perfect for quick tests and generating ~4 full HD videos',
    popular: false,
  },
  {
    id: 'plus',
    name: 'Plus Pack',
    credits: 250,
    price: 10,
    bonusCredits: 25,
    badge: 'Most Popular',
    description: 'Great for weekly creators, includes 25 bonus credits',
    popular: true,
  },
  {
    id: 'large',
    name: 'Large Pack',
    credits: 600,
    price: 20,
    bonusCredits: 100,
    badge: 'Best Value',
    description: 'For power users and commercial projects, best per-credit rate',
    popular: false,
  },
];
