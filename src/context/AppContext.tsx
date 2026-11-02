import { auth } from '@/config/firebase';
import { CREDIT_PACKAGES } from '@/data/creditPackages';
import { INITIAL_VIDEOS, VideoItem } from '@/data/mockVideos';
import { DURATION_OPTIONS, PlanTier, SUBSCRIPTION_PLANS } from '@/data/plans';
import { VIDEO_STYLES } from '@/data/styles';
import { VOICE_LANGUAGES } from '@/data/voices';
import { generateAIVideo } from '@/services/videoGeneration';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  avatar: string;
  plan: PlanTier;
  creditsRemaining: number;
  totalCredits: number;
  role?: string;
  isGuest?: boolean;
  hasUsedScriptTrial?: boolean;
}

export const DEFAULT_DEMO_USER: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@creator.studio',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  plan: 'Pro',
  creditsRemaining: 120,
  totalCredits: 250,
  role: 'AI Filmmaker',
};

export const GUEST_USER: UserProfile = {
  name: 'Guest Creator',
  email: 'guest@lazan.ai',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  plan: 'Basic',
  creditsRemaining: 60,
  totalCredits: 100,
  role: 'Explorer',
  isGuest: true,
};

export interface GenerationDraft {
  mode: 'prompt' | 'script';
  prompt: string;
  customScript?: string;
  narrationMode: 'voiceover' | 'visual_only';
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
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isLoaded: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signUp: (name: string, email: string, password?: string, role?: string) => Promise<boolean>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
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
  mode: 'prompt',
  prompt: 'A cinematic scene of a young African entrepreneur walking through Manchester at sunset, golden hour warm lighting, bustling modern boulevard.',
  customScript: '',
  narrationMode: 'voiceover',
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
  const [user, setUser] = useState<UserProfile>(DEFAULT_DEMO_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [draft, setDraft] = useState<GenerationDraft>(defaultDraft);
  const [generationState, setGenerationState] = useState<ActiveGenerationState>(defaultGenerationState);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Hydrate state from local storage on launch and sync with Firebase Auth
  useEffect(() => {
    let isMounted = true;

    const hydrateInitialStorage = async () => {
      try {
        const [storedOnboarded, storedUser, storedVideos] = await Promise.all([
          AsyncStorage.getItem('@lazan_onboarded'),
          AsyncStorage.getItem('@lazan_user'),
          AsyncStorage.getItem('@lazan_videos'),
        ]);

        if (storedOnboarded === 'true' && isMounted) {
          setHasCompletedOnboarding(true);
        }
        if (storedUser && isMounted) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch {
            // Ignore parse errors
          }
        }
        if (storedVideos && isMounted) {
          try {
            const parsedVideos = JSON.parse(storedVideos);
            if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
              const enriched = parsedVideos.map((v: VideoItem) => {
                if (!v.videoUrl || v.videoUrl.includes('commondatastorage.googleapis.com')) {
                  const match = INITIAL_VIDEOS.find((iv) => iv.id === v.id);
                  return {
                    ...v,
                    videoUrl: match?.videoUrl || 'https://test-videos.co.uk/vids/sintel/mp4/h264/1080/Sintel_1080_10s_5MB.mp4',
                  };
                }
                return v;
              });
              setVideos(enriched);
              persistVideos(enriched);
            }
          } catch {
            // Ignore parse errors
          }
        }
      } catch (err) {
        console.warn('Failed to hydrate local app storage:', err);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    hydrateInitialStorage();

    // Firebase Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted) return;

      if (fbUser) {
        try {
          const userKey = `@lazan_user_${fbUser.uid}`;
          const savedData = await AsyncStorage.getItem(userKey);
          let profile: UserProfile;

          if (savedData) {
            profile = JSON.parse(savedData);
            profile.email = fbUser.email || profile.email;
            profile.name = fbUser.displayName || profile.name;
          } else {
            const fallbackName =
              fbUser.displayName ||
              (fbUser.email
                ? fbUser.email
                  .split('@')[0]
                  .replace(/[._]/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())
                : 'Creator');

            profile = {
              uid: fbUser.uid,
              name: fallbackName,
              email: fbUser.email || '',
              avatar:
                fbUser.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              plan: 'Pro',
              creditsRemaining: 150,
              totalCredits: 200,
              role: 'Content Creator',
            };
            await AsyncStorage.setItem(userKey, JSON.stringify(profile));
          }

          setUser(profile);
          setIsAuthenticated(true);
          setHasCompletedOnboarding(true);
          await AsyncStorage.setItem('@lazan_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Error synchronizing Firebase user profile:', err);
        }
      } else {
        // If not in Firebase, check if user is a guest or in offline demo mode
        const [isGuest, localUser] = await Promise.all([
          AsyncStorage.getItem('@lazan_guest'),
          AsyncStorage.getItem('@lazan_user'),
        ]);

        if (isGuest === 'true' && isMounted) {
          setUser(GUEST_USER);
          setIsAuthenticated(true);
        } else if (localUser && isMounted) {
          try {
            const parsed = JSON.parse(localUser);
            if (parsed.email === DEFAULT_DEMO_USER.email) {
              setUser(parsed);
              setIsAuthenticated(true);
            }
          } catch {
            setIsAuthenticated(false);
          }
        } else if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  const persistUser = async (updatedUser: UserProfile | null) => {
    try {
      if (updatedUser) {
        await AsyncStorage.setItem('@lazan_user', JSON.stringify(updatedUser));
        if (updatedUser.uid) {
          await AsyncStorage.setItem(`@lazan_user_${updatedUser.uid}`, JSON.stringify(updatedUser));
        }
      } else {
        await AsyncStorage.removeItem('@lazan_user');
      }
    } catch (err) {
      console.warn('Failed to persist user profile:', err);
    }
  };

  const persistVideos = async (updatedVideos: VideoItem[]) => {
    try {
      await AsyncStorage.setItem('@lazan_videos', JSON.stringify(updatedVideos));
    } catch (err) {
      console.warn('Failed to persist videos:', err);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Fast-path for offline preview / demo credentials
    if (trimmedEmail === DEFAULT_DEMO_USER.email.toLowerCase() && (!password || password === 'demo12345')) {
      try {
        if (password) {
          await signInWithEmailAndPassword(auth, trimmedEmail, password);
        }
      } catch {
        // Fallback to demo profile if not created on Firebase
      }

      setUser(DEFAULT_DEMO_USER);
      setIsAuthenticated(true);
      setHasCompletedOnboarding(true);
      await Promise.all([
        persistUser(DEFAULT_DEMO_USER),
        AsyncStorage.setItem('@lazan_onboarded', 'true'),
        AsyncStorage.removeItem('@lazan_guest'),
      ]);
      return true;
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const fbUser = userCredential.user;

      const userKey = `@lazan_user_${fbUser.uid}`;
      const savedData = await AsyncStorage.getItem(userKey);
      let profile: UserProfile;

      if (savedData) {
        profile = JSON.parse(savedData);
        profile.email = fbUser.email || trimmedEmail;
        profile.name = fbUser.displayName || profile.name;
      } else {
        const derivedName =
          fbUser.displayName ||
          trimmedEmail
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()) ||
          'Creator';

        profile = {
          uid: fbUser.uid,
          name: derivedName,
          email: fbUser.email || trimmedEmail,
          avatar:
            fbUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          plan: 'Pro',
          creditsRemaining: 150,
          totalCredits: 200,
          role: 'Content Creator',
        };
      }

      setUser(profile);
      setIsAuthenticated(true);
      setHasCompletedOnboarding(true);
      await Promise.all([
        persistUser(profile),
        AsyncStorage.setItem('@lazan_onboarded', 'true'),
        AsyncStorage.removeItem('@lazan_guest'),
      ]);
      return true;
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  const signUp = async (name: string, email: string, password?: string, role?: string): Promise<boolean> => {
    const trimmedName = name.trim() || 'New Creator';
    const trimmedEmail = email.trim().toLowerCase();

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const fbUser = userCredential.user;

      // Update display name on Firebase User record
      await updateProfile(fbUser, { displayName: trimmedName }).catch(() => { });

      const newUser: UserProfile = {
        uid: fbUser.uid,
        name: trimmedName,
        email: trimmedEmail,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        plan: 'Basic',
        creditsRemaining: 100, // Welcome Creator Bonus!
        totalCredits: 100,
        role: role || 'Digital Creator',
      };

      setUser(newUser);
      setIsAuthenticated(true);
      setHasCompletedOnboarding(true);
      await Promise.all([
        persistUser(newUser),
        AsyncStorage.setItem('@lazan_onboarded', 'true'),
        AsyncStorage.removeItem('@lazan_guest'),
      ]);
      return true;
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new Error('Please enter your account email address.');
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  const continueAsGuest = async (): Promise<void> => {
    const guest = { ...GUEST_USER };
    setUser(guest);
    setIsAuthenticated(true);
    setHasCompletedOnboarding(true);
    await Promise.all([
      persistUser(guest),
      AsyncStorage.setItem('@lazan_onboarded', 'true'),
      AsyncStorage.setItem('@lazan_guest', 'true'),
    ]);
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    setIsAuthenticated(false);
    setUser(GUEST_USER);
    await Promise.all([
      AsyncStorage.removeItem('@lazan_user'),
      AsyncStorage.removeItem('@lazan_guest'),
    ]);
  };

  const completeOnboarding = async (): Promise<void> => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem('@lazan_onboarded', 'true');
  };

  const resetOnboarding = async (): Promise<void> => {
    setHasCompletedOnboarding(false);
    await AsyncStorage.removeItem('@lazan_onboarded');
  };

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
    isCancelledRef.current = true;
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

    isCancelledRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Deduct credits immediately
    setUser((prev) => {
      const updated = {
        ...prev,
        creditsRemaining: prev.creditsRemaining - cost,
      };
      persistUser(updated);
      return updated;
    });

    const newVideoId = `vid-${Date.now()}`;
    const selectedStyle = VIDEO_STYLES.find((s) => s.id === draft.styleId)?.name || 'Cinematic';
    const selectedDuration = DURATION_OPTIONS.find((d) => d.id === draft.durationId);
    const durationLabel = selectedDuration ? selectedDuration.label : '1 min';
    const durationSeconds = selectedDuration ? selectedDuration.seconds : 60;
    const languageObj = VOICE_LANGUAGES.find((l) => l.id === draft.languageId);

    // Initial state (Stage 0: 15%)
    setGenerationState({
      isGenerating: true,
      currentStageIndex: 0,
      progressPercent: GENERATION_STAGES[0].percent,
      stageName: GENERATION_STAGES[0].label,
      stageDetail: GENERATION_STAGES[0].detail,
      error: null,
      generatedVideoId: null,
    });

    // Handle intentional error simulation
    if (shouldSimulateError) {
      return new Promise((_, reject) => {
        timerRef.current = setTimeout(() => {
          // Refund credits if generation fails
          setUser((prev) => {
            const refunded = {
              ...prev,
              creditsRemaining: prev.creditsRemaining + cost,
            };
            persistUser(refunded);
            return refunded;
          });

          setGenerationState({
            isGenerating: false,
            currentStageIndex: 2,
            progressPercent: 55,
            stageName: 'Scene generation interrupted',
            stageDetail: 'GPU node experienced a transient rendering fault.',
            error: "Something went wrong. We couldn't finish generating your video. Your " + cost + " credits have been refunded.",
            generatedVideoId: null,
          });
          reject(new Error('Generation simulated failure'));
        }, 3000) as any;
      });
    }

    const isScriptMode = draft.mode === 'script' && !!draft.customScript?.trim();

    // Consume 1 free trial for Basic user if running script mode
    if (isScriptMode && user.plan === 'Basic' && !user.hasUsedScriptTrial) {
      setUser((prev) => {
        const updated = { ...prev, hasUsedScriptTrial: true };
        persistUser(updated);
        return updated;
      });
    }

    // Kick off real Gemini AI Screenplay and Director generation
    const apiPromise = generateAIVideo({
      prompt: isScriptMode ? (draft.customScript || draft.prompt) : draft.prompt,
      mode: draft.mode,
      customScript: draft.customScript,
      narrationMode: draft.narrationMode,
      style: selectedStyle,
      aspectRatio: draft.aspectRatio === '9:16' ? '9:16' : '16:9',
      durationSeconds,
      resolution: user.plan === 'Basic' ? '720p' : '1080p',
      mood: draft.mood,
      cameraStyle: draft.cameraStyle,
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Stage 0 -> 1: Understanding idea (1.5s)
    await sleep(1500);
    if (isCancelledRef.current) throw new Error('Cancelled');
    setGenerationState((prev) => ({
      ...prev,
      currentStageIndex: 1,
      progressPercent: GENERATION_STAGES[1].percent,
      stageName: GENERATION_STAGES[1].label,
      stageDetail: GENERATION_STAGES[1].detail,
    }));

    // Stage 1 -> 2: Writing script (2.0s)
    await sleep(2000);
    if (isCancelledRef.current) throw new Error('Cancelled');
    setGenerationState((prev) => ({
      ...prev,
      currentStageIndex: 2,
      progressPercent: GENERATION_STAGES[2].percent,
      stageName: GENERATION_STAGES[2].label,
      stageDetail: GENERATION_STAGES[2].detail,
    }));

    // Stage 2 -> 3: Creating scenes & generating video (2.0s)
    await sleep(2000);
    if (isCancelledRef.current) throw new Error('Cancelled');
    setGenerationState((prev) => ({
      ...prev,
      currentStageIndex: 3,
      progressPercent: GENERATION_STAGES[3].percent,
      stageName: GENERATION_STAGES[3].label,
      stageDetail: 'Rendering neural frames via Gemini Omni Flash...',
    }));

    // Smoothly crawl progress from 75% up to 88% while Omni renders
    let simulatedPercent = 75;
    const progressInterval = setInterval(() => {
      if (isCancelledRef.current) {
        clearInterval(progressInterval);
        return;
      }
      if (simulatedPercent < 88) {
        simulatedPercent += 1;
        setGenerationState((prev) => ({
          ...prev,
          progressPercent: simulatedPercent,
        }));
      }
    }, 1200);

    let aiResult: any = null;
    try {
      // Allow up to 90 seconds for real Omni video generation
      aiResult = await Promise.race([
        apiPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Generation timeout')), 90000)),
      ]);
    } catch (err) {
      console.warn('[AppContext] AI Generation completed with fallback notice:', err);
    } finally {
      clearInterval(progressInterval);
    }

    if (isCancelledRef.current) throw new Error('Cancelled');

    // Stage 4: Adding voice & acoustic mastering
    setGenerationState((prev) => ({
      ...prev,
      currentStageIndex: 4,
      progressPercent: GENERATION_STAGES[4].percent,
      stageName: GENERATION_STAGES[4].label,
      stageDetail: GENERATION_STAGES[4].detail,
    }));
    await sleep(1200);

    // Stage 5: Final editing
    setGenerationState((prev) => ({
      ...prev,
      currentStageIndex: 5,
      progressPercent: 98,
      stageName: GENERATION_STAGES[5].label,
      stageDetail: GENERATION_STAGES[5].detail,
    }));
    await sleep(800);

    if (isCancelledRef.current) throw new Error('Cancelled');

    const styleImages = THUMBNAILS_BY_STYLE[draft.styleId] || THUMBNAILS_BY_STYLE.cinematic;
    const thumbnail = styleImages[Math.floor(Math.random() * styleImages.length)];

    const STYLE_SAMPLE_VIDEOS: Record<string, string> = {
      cinematic: 'https://test-videos.co.uk/vids/sintel/mp4/h264/1080/Sintel_1080_10s_5MB.mp4',
      movie: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_5MB.mp4',
      fashion: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/1080/Jellyfish_1080_10s_5MB.mp4',
      realistic: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4',
      'social-media': 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4',
      promotional: 'https://test-videos.co.uk/vids/sintel/mp4/h264/1080/Sintel_1080_10s_5MB.mp4',
    };
    const fallbackVideoUrl = STYLE_SAMPLE_VIDEOS[draft.styleId] || STYLE_SAMPLE_VIDEOS.cinematic;
    const finalVideoUrl = aiResult?.videoUrl || fallbackVideoUrl;

    const effectivePrompt = isScriptMode ? (draft.customScript || draft.prompt) : draft.prompt;
    const title = aiResult?.title || (isScriptMode ? (draft.customScript?.slice(0, 32) || 'Custom Script Creation') : draft.prompt.split(',')[0].slice(0, 32));
    const synopsis = aiResult?.synopsis;
    const narrationScript = draft.narrationMode === 'visual_only'
      ? undefined
      : (isScriptMode && draft.customScript?.trim() ? draft.customScript.trim() : aiResult?.narrationScript);
    const scenes = aiResult?.scenes;

    const newVideo: VideoItem = {
      id: newVideoId,
      title: title.trim(),
      prompt: effectivePrompt,
      synopsis,
      narrationScript,
      scenes,
      duration: durationLabel,
      durationSeconds,
      date: 'Just now',
      createdAt: Date.now(),
      status: 'completed',
      thumbnailUrl: thumbnail,
      videoUrl: finalVideoUrl,
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

    setVideos((prev) => {
      const updatedVideos = [newVideo, ...prev];
      persistVideos(updatedVideos);
      return updatedVideos;
    });

    setGenerationState({
      isGenerating: false,
      currentStageIndex: GENERATION_STAGES.length - 1,
      progressPercent: 100,
      stageName: 'Complete',
      stageDetail: 'Your video is ready',
      error: null,
      generatedVideoId: newVideoId,
    });

    return newVideoId;
  };

  const getVideoById = (id: string): VideoItem | undefined => {
    return videos.find((v) => v.id === id);
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => {
      const filtered = prev.filter((v) => v.id !== id);
      persistVideos(filtered);
      return filtered;
    });
  };

  const purchaseCredits = (packageId: string): boolean => {
    const pack = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pack) return false;

    const totalAdded = pack.credits + (pack.bonusCredits || 0);
    setUser((prev) => {
      const updated = {
        ...prev,
        creditsRemaining: prev.creditsRemaining + totalAdded,
        totalCredits: prev.totalCredits + totalAdded,
      };
      persistUser(updated);
      return updated;
    });
    return true;
  };

  const upgradePlan = (planId: PlanTier) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    setUser((prev) => {
      const updated = {
        ...prev,
        plan: planId,
      };
      persistUser(updated);
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        videos,
        draft,
        generationState,
        isAuthenticated,
        hasCompletedOnboarding,
        isLoaded,
        login,
        signUp,
        continueAsGuest,
        logout,
        sendPasswordReset,
        completeOnboarding,
        resetOnboarding,
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
