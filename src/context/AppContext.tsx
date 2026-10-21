import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { INITIAL_VIDEOS, VideoItem } from '@/data/mockVideos';
import { PlanTier, SUBSCRIPTION_PLANS, DURATION_OPTIONS, VideoDurationOption } from '@/data/plans';
import { CREDIT_PACKAGES, CreditPackage } from '@/data/creditPackages';
import { VIDEO_STYLES } from '@/data/styles';
import { VOICE_LANGUAGES } from '@/data/voices';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: PlanTier;
  creditsRemaining: number;
  totalCredits: number;
}

export interface GenerationDraft {
  prompt: string;
  styleId: string;
  durationId: string;
  voiceGender: 'male' | 'female';
  voiceStyle: 'narration' | 'dialogue' | 'none';
  languageId: string;
  cameraStyle: string;
  aspectRatio: string;
  mood: string;
  backgroundMusic: boolean;
  soundEffects: boolean;
}

export interface GenerationStage {
  id: number;
  label: string;
  detail: string;
  percent: number;
}

export const GENERATION_STAGES: GenerationStage[] = [
  { id: 1, label: 'Understanding your idea', detail: 'Parsing semantics, theme, and pacing cues', percent: 15 },
  { id: 2, label: 'Writing your script', detail: 'Composing shot list, visual beats, and narration timing', percent: 35 },
  { id: 3, label: 'Creating scenes', detail: 'Synthesizing 3D camera angles and lighting setups', percent: 55 },
  { id: 4, label: 'Generating video', detail: 'Rendering temporal frames at 24fps high bitrate', percent: 75 },
  { id: 5, label: 'Adding voice', detail: 'Harmonizing narration and acoustic spatial sound', percent: 90 },
  { id: 6, label: 'Final editing', detail: 'Color grading, cinematic grain, and mastering stream', percent: 100 },
];

export interface ActiveGenerationState {
  isGenerating: boolean;
  currentStageIndex: number;
  progressPercent: number;
  stageName: string;
  stageDetail: string;
  error: string | null;
  generatedVideoId: string | null;
}

interface AppContextType {
  user: UserProfile;
  videos: VideoItem[];
  draft: GenerationDraft;
  generationState: ActiveGenerationState;
  updateDraft: (updates: Partial<GenerationDraft>) => void;
  resetDraft: () => void;
  improveDraftPrompt: () => void;
  calculateCost: (durationId?: string) => number;
  canPlanAccessDuration: (durationId: string) => boolean;
  startGeneration: (shouldSimulateError?: boolean) => Promise<string>;
  cancelGeneration: () => void;
  resetGenerationState: () => void;
  getVideoById: (id: string) => VideoItem | undefined;
  deleteVideo: (id: string) => void;
  purchaseCredits: (packageId: string) => boolean;
  upgradePlan: (planId: PlanTier) => void;
}

const defaultDraft: GenerationDraft = {
  prompt: 'A cinematic scene of a young African entrepreneur walking through Kigali at sunset, golden hour warm lighting, bustling modern boulevard.',
  styleId: 'cinematic',
  durationId: '1m',
  voiceGender: 'female',
  voiceStyle: 'narration',
  languageId: 'en-af',
  cameraStyle: 'cinematic',
  aspectRatio: '16:9',
  mood: 'inspiring',
  backgroundMusic: true,
  soundEffects: true,
};

const defaultGenerationState: ActiveGenerationState = {
  isGenerating: false,
  currentStageIndex: 0,
  progressPercent: 0,
  stageName: '',
  stageDetail: '',
  error: null,
  generatedVideoId: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const THUMBNAILS_BY_STYLE: Record<string, string[]> = {
  cinematic: [
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
  ],
  realistic: [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
  ],
  movie: [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
  ],
  'social-media': [
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
  ],
  educational: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
  ],
  promotional: [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
  ],
  comedy: [
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80',
  ],
  'love-story': [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop&q=80',
  ],
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Rivera',
    email: 'alex.rivera@creator.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    plan: 'Pro',
    creditsRemaining: 120,
    totalCredits: 250,
  });

  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [draft, setDraft] = useState<GenerationDraft>(defaultDraft);
  const [generationState, setGenerationState] = useState<ActiveGenerationState>(defaultGenerationState);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const updateDraft = (updates: Partial<GenerationDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const resetDraft = () => {
    setDraft(defaultDraft);
  };

  const improveDraftPrompt = () => {
    const selectedStyle = VIDEO_STYLES.find((s) => s.id === draft.styleId);
    const styleModifier = selectedStyle?.promptModifier || 'cinematic lighting, ultra-realistic detail, smooth motion';
    
    // Enrich the existing prompt
    const trimmed = draft.prompt.trim();
    if (!trimmed) {
      setDraft((prev) => ({
        ...prev,
        prompt: 'A majestic cinematic drone shot of a futuristic eco-city with lush vertical gardens and solar transit, golden hour light, 4k ultra-high definition.',
      }));
      return;
    }

    if (trimmed.includes('cinematic') || trimmed.includes('4k')) {
      setDraft((prev) => ({
        ...prev,
        prompt: `${trimmed}. Masterful volumetric atmosphere, anamorphic bokeh, authentic high-fidelity soundscape, vivid color grading.`,
      }));
    } else {
      setDraft((prev) => ({
        ...prev,
        prompt: `${trimmed} — filmed with ${styleModifier}, 8k fidelity, perfectly timed visual transitions.`,
      }));
    }
  };

  const calculateCost = (durationId?: string): number => {
    const targetDurationId = durationId || draft.durationId;
    const option = DURATION_OPTIONS.find((d) => d.id === targetDurationId);
    return option ? option.creditCost : 25;
  };

  const canPlanAccessDuration = (durationId: string): boolean => {
    const planHierarchy: Record<PlanTier, number> = {
      Basic: 1,
      Pro: 2,
      Premium: 3,
    };

    const option = DURATION_OPTIONS.find((d) => d.id === durationId);
    if (!option) return false;

    return planHierarchy[user.plan] >= planHierarchy[option.minPlan];
  };

  const cancelGeneration = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGenerationState(defaultGenerationState);
  };

  const resetGenerationState = () => {
    setGenerationState(defaultGenerationState);
  };

  const startGeneration = async (shouldSimulateError: boolean = false): Promise<string> => {
    const cost = calculateCost();

    if (user.creditsRemaining < cost) {
      setGenerationState((prev) => ({
        ...prev,
        isGenerating: false,
        error: 'Insufficient credits. You need ' + cost + ' credits but only have ' + user.creditsRemaining + '.',
      }));
      throw new Error('Insufficient credits');
    }

    // Deduct credits immediately
    setUser((prev) => ({
      ...prev,
      creditsRemaining: prev.creditsRemaining - cost,
    }));

    const newVideoId = `vid-${Date.now()}`;
    const selectedStyle = VIDEO_STYLES.find((s) => s.id === draft.styleId)?.name || 'Cinematic';
    const selectedDuration = DURATION_OPTIONS.find((d) => d.id === draft.durationId);
    const durationLabel = selectedDuration ? selectedDuration.label : '1 min';
    const durationSeconds = selectedDuration ? selectedDuration.seconds : 60;
    const languageObj = VOICE_LANGUAGES.find((l) => l.id === draft.languageId);

    // Initial state
    setGenerationState({
      isGenerating: true,
      currentStageIndex: 0,
      progressPercent: GENERATION_STAGES[0].percent,
      stageName: GENERATION_STAGES[0].label,
      stageDetail: GENERATION_STAGES[0].detail,
      error: null,
      generatedVideoId: null,
    });

    return new Promise((resolve, reject) => {
      let currentStage = 0;

      timerRef.current = setInterval(() => {
        currentStage++;

        // Simulate error on step 3 if requested
        if (shouldSimulateError && currentStage === 3) {
          if (timerRef.current) clearInterval(timerRef.current);
          
          // Refund credits if generation fails
          setUser((prev) => ({
            ...prev,
            creditsRemaining: prev.creditsRemaining + cost,
          }));

          setGenerationState({
            isGenerating: false,
            currentStageIndex: 3,
            progressPercent: 55,
            stageName: 'Scene generation interrupted',
            stageDetail: 'GPU node experienced a transient rendering fault.',
            error: "Something went wrong. We couldn't finish generating your video. Your " + cost + " credits have been refunded.",
            generatedVideoId: null,
          });
          reject(new Error('Generation failed'));
          return;
        }

        if (currentStage < GENERATION_STAGES.length) {
          const stage = GENERATION_STAGES[currentStage];
          setGenerationState((prev) => ({
            ...prev,
            currentStageIndex: currentStage,
            progressPercent: stage.percent,
            stageName: stage.label,
            stageDetail: stage.detail,
          }));
        } else {
          // Completed
          if (timerRef.current) clearInterval(timerRef.current);

          const styleImages = THUMBNAILS_BY_STYLE[draft.styleId] || THUMBNAILS_BY_STYLE.cinematic;
          const thumbnail = styleImages[Math.floor(Math.random() * styleImages.length)];

          // Derive a catchy title from prompt
          let title = draft.prompt.split(',')[0].slice(0, 32);
          if (title.length < 5) title = 'Untitled AI Creation';

          const newVideo: VideoItem = {
            id: newVideoId,
            title: title.trim(),
            prompt: draft.prompt,
            duration: durationLabel,
            durationSeconds,
            date: 'Just now',
            createdAt: Date.now(),
            status: 'completed',
            thumbnailUrl: thumbnail,
            style: selectedStyle,
            styleId: draft.styleId,
            voice: draft.voiceStyle === 'none' ? 'No Voice' : `${draft.voiceGender === 'female' ? 'Female' : 'Male'} ${draft.voiceStyle}`,
            language: languageObj ? languageObj.name : 'English',
            aspectRatio: draft.aspectRatio,
            camera: draft.cameraStyle,
            resolution: user.plan === 'Basic' ? '720p HD' : '1080p FHD',
            fileSize: `${Math.round(durationSeconds * 0.55 * 10) / 10} MB`,
            creditsUsed: cost,
          };

          setVideos((prev) => [newVideo, ...prev]);

          setGenerationState({
            isGenerating: false,
            currentStageIndex: GENERATION_STAGES.length - 1,
            progressPercent: 100,
            stageName: 'Complete',
            stageDetail: 'Your video is ready 🎉',
            error: null,
            generatedVideoId: newVideoId,
          });

          resolve(newVideoId);
        }
      }, 1200); // 1.2s per stage = ~7.2s total smooth deterministic mock flow
    });
  };

  const getVideoById = (id: string): VideoItem | undefined => {
    return videos.find((v) => v.id === id);
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const purchaseCredits = (packageId: string): boolean => {
    const pack = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pack) return false;

    const totalAdded = pack.credits + (pack.bonusCredits || 0);
    setUser((prev) => ({
      ...prev,
      creditsRemaining: prev.creditsRemaining + totalAdded,
      totalCredits: prev.totalCredits + totalAdded,
    }));
    return true;
  };

  const upgradePlan = (planId: PlanTier) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    setUser((prev) => ({
      ...prev,
      plan: planId,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        videos,
        draft,
        generationState,
        updateDraft,
        resetDraft,
        improveDraftPrompt,
        calculateCost,
        canPlanAccessDuration,
        startGeneration,
        cancelGeneration,
        resetGenerationState,
        getVideoById,
        deleteVideo,
        purchaseCredits,
        upgradePlan,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
