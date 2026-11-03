import { GoogleGenAI } from '@google/genai';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { BrandAsset } from '@/data/mockVideos';

export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Singleton Google GenAI client
let aiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (!aiClient) {
    if (!GEMINI_API_KEY) {
      throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
    }
    aiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
  }
  return aiClient;
}

/**
 * Loads image binary from local URI or web data URL into base64 for multimodal vision analysis.
 */
async function getAssetBase64(uri: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    if (uri.startsWith('data:image/')) {
      const parts = uri.split(';base64,');
      const mime = parts[0].replace('data:', '');
      return { data: parts[1], mimeType: mime };
    }

    if (Platform.OS === 'web') {
      const res = await fetch(uri);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const mime = blob.type || 'image/png';
          const base64 = base64data.split(',')[1] || base64data;
          resolve({ data: base64, mimeType: mime });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }

    // Native iOS / Android
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeType =
      extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : extension === 'webp'
        ? 'image/webp'
        : 'image/png';

    return { data: base64, mimeType };
  } catch (err) {
    console.warn('[VideoGeneration] Failed to load brand asset for analysis:', err);
    return null;
  }
}

export interface AIScene {
  sceneNumber: number;
  timestamp?: string;
  title: string;
  shotType: string;
  visualDescription: string;
  cameraMovement: string;
  narrationSnippet?: string;
}

export interface VideoGenerationParams {
  prompt: string;
  mode?: 'prompt' | 'script';
  customScript?: string;
  narrationMode?: 'voiceover' | 'visual_only';
  style?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | string;
  durationSeconds?: number;
  resolution?: '720p' | '1080p' | '4k';
  mood?: string;
  cameraStyle?: string;
  mockDiffusion?: boolean;
  assets?: BrandAsset[];
  watermarkLogo?: boolean;
}

export interface VideoGenerationResult {
  success: boolean;
  title: string;
  synopsis: string;
  narrationScript: string;
  scenes: AIScene[];
  videoUrl?: string;
  source: 'google-omni' | 'gemini-director' | 'fallback';
  message?: string;
}

/**
 * Intelligent screenplay scene generator that partitions a user script or prompt
 * into sequential, cinematic scenes spanning the exact requested duration (e.g. 1m or 2m).
 */
export function generateSequentialScenes(
  scriptText: string,
  prompt: string,
  isScript: boolean,
  durationSeconds: number,
  targetSceneCount: number,
  style: string,
  cameraStyle: string,
  isVisualOnly: boolean
): AIScene[] {
  const sceneDuration = Math.max(1, Math.floor(durationSeconds / targetSceneCount));

  let scriptChunks: string[] = [];
  if (isScript && scriptText.trim()) {
    // Split on sentence boundaries or newlines
    const rawSentences = scriptText
      .split(/(?<=[.?!;])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const sentences = rawSentences.length > 0 ? rawSentences : [scriptText.trim()];

    if (sentences.length <= targetSceneCount) {
      for (let i = 0; i < targetSceneCount; i++) {
        const sentenceIdx = Math.min(i, sentences.length - 1);
        scriptChunks.push(sentences[sentenceIdx]);
      }
    } else {
      const itemsPerChunk = Math.ceil(sentences.length / targetSceneCount);
      for (let i = 0; i < targetSceneCount; i++) {
        const chunk = sentences.slice(i * itemsPerChunk, (i + 1) * itemsPerChunk).join(' ');
        scriptChunks.push(chunk || sentences[sentences.length - 1]);
      }
    }
  }

  const shotTypes = [
    'Establishing Wide Shot',
    'Medium Narrative Focus',
    'Dynamic Tracking Shot',
    'Intimate Character Close-Up',
    'Sweeping Drone Aerial',
    'Low-Angle Cinematic Hero Shot',
    'Over-the-Shoulder Detail',
    'Climactic Resolution Shot',
  ];

  const cameraMovements = [
    'Slow cinematic push-in with shallow anamorphic depth of field',
    'Smooth horizontal tracking dolly across scene elements',
    'Low-angle upward tilt with dramatic atmospheric lighting',
    'Fluid orbital steadicam movement around focal subject',
    'Gentle lateral pan capturing environment scale',
    'Slow zoom into emotional detail',
    'Sweeping cinematic crane pull-out revealing grand vista',
    'Dynamic handheld motion with natural cinematic energy',
  ];

  const scenes: AIScene[] = [];
  for (let i = 0; i < targetSceneCount; i++) {
    const startSec = i * sceneDuration;
    const endSec = i === targetSceneCount - 1 ? durationSeconds : (i + 1) * sceneDuration;
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60) < 10 ? '0' : ''}${s % 60}`;
    const timestamp = `${formatTime(startSec)} - ${formatTime(endSec)}`;

    const snippet = isScript
      ? (scriptChunks[i] || scriptChunks[scriptChunks.length - 1] || scriptText)
      : `Scene ${i + 1}: ${prompt}`;

    const snippetWords = snippet.split(' ').slice(0, 5).join(' ');

    scenes.push({
      sceneNumber: i + 1,
      timestamp,
      title: isScript ? `Scene ${i + 1}: ${snippetWords}...` : `Scene ${i + 1}: ${shotTypes[i % shotTypes.length]}`,
      shotType: shotTypes[i % shotTypes.length],
      visualDescription: isScript
        ? `Cinematic realization: "${snippet}". Styled with ${style.toLowerCase()} lighting and high visual fidelity.`
        : `${prompt} — scene progression ${i + 1} of ${targetSceneCount} with ${style.toLowerCase()} atmosphere.`,
      cameraMovement: cameraMovements[i % cameraMovements.length],
      narrationSnippet: isVisualOnly ? '' : snippet,
    });
  }

  return scenes;
}

/**
 * Generates an AI video using Google's Gemini Omni 1.1 Flash model (gemini-omni-1.1-flash)
 * for true text-to-video diffusion, paired with Gemini 3.8 Flash for screenplay direction.
 */
export async function generateAIVideo(
  params: VideoGenerationParams
): Promise<VideoGenerationResult> {
  const {
    prompt,
    mode = 'prompt',
    customScript,
    narrationMode = 'voiceover',
    style = 'Cinematic',
    aspectRatio = '16:9',
    durationSeconds = 10,
    mood = 'Inspiring',
    cameraStyle = 'Cinematic tracking shot',
    assets = [],
    watermarkLogo = false,
  } = params;

  try {
    const ai = getGenAIClient();
    const isScript = mode === 'script' && !!customScript?.trim();
    const scriptText = isScript && customScript ? customScript.trim() : '';
    const isVisualOnly = narrationMode === 'visual_only';
    const targetSceneCount = durationSeconds >= 15 ? 3 : durationSeconds >= 10 ? 2 : 1;
    const durationLabel = `${durationSeconds} seconds`;
    const isPortrait = aspectRatio === '9:16';
    const isSquare = aspectRatio === '1:1';
    const ratioTag = isPortrait
      ? 'aspect ratio: 9:16 vertical portrait format (mobile TikTok, Instagram Reels, Shorts format, 1080x1920)'
      : isSquare
      ? 'aspect ratio: 1:1 square format (Instagram feed 1080x1080)'
      : 'aspect ratio: 16:9 widescreen landscape format (YouTube, cinema 1920x1080)';

    // Inspect attached brand logo/flyer via Gemini Flash Multimodal Vision
    let brandInsight = '';
    const primaryAsset = assets.find((a) => a.type === 'logo') || assets[0];
    if (primaryAsset) {
      try {
        const assetData = await getAssetBase64(primaryAsset.uri);
        if (assetData) {
          const visionRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: assetData.data,
                      mimeType: assetData.mimeType,
                    },
                  },
                  {
                    text: 'Identify in 1 short sentence: 1) The exact brand/company name shown in this logo, and 2) The key brand colors and aesthetic style (e.g. modern corporate, neon gaming, luxury serif).',
                  },
                ],
              },
            ],
          });
          brandInsight = visionRes.text?.trim() || '';
          console.log('[VideoGeneration] 🔍 Brand Asset Inspected via Vision:', brandInsight);
        }
      } catch (err) {
        console.warn('[VideoGeneration] Multimodal vision inspection fallback:', err);
      }
    }

    const brandDirective = assets.length > 0
      ? `\n\nCRITICAL BRAND ASSET & WATERMARK RULES:
- The user has provided an official company logo/watermark asset (${assets.map((a) => `"${a.name}"`).join(', ')}).
${brandInsight ? `- Verified Brand Details: ${brandInsight}` : ''}
- STRICT NEGATIVE DIRECTIVE: DO NOT paint, draw, hallucinate, generate, or render any fake, fictional, or artificial logos, corporate symbols, or random company crests inside the video scenes. AI video diffusion models must NEVER attempt to synthesize corporate logos as it corrupts brand integrity.
- The user's authentic provided logo asset is overlaid cleanly as the official high-resolution watermark overlay on the video player.
- Your role is to harmoniously match the scene lighting, color grading, wardrobe, and environment to the client's verified brand aesthetic while keeping all background surfaces clean without artificial logos.`
      : '';

    const diffusionBrandTag = assets.length > 0
      ? ` Clean commercial scene composition, color grading matching brand palette, with space for watermark overlay. NO artificial watermark, NO fake text or hallucinated logos in the scene.`
      : '';

    // 1. Kick off Gemini Omni 1.1 Flash Video Generation (Bypassed in Test Mode to preserve Cloud credits)
    const isMock = params.mockDiffusion ?? (process.env.EXPO_PUBLIC_MOCK_VIDEO_DIFFUSION === 'true');

    let omniPromise: Promise<any>;
    if (isMock) {
      console.log('[VideoGeneration] ⚡ Free Test Mode: Bypassing Google Omni GPU diffusion to preserve Cloud credits.');
      omniPromise = Promise.resolve(null);
    } else {
      const diffusionInput = isScript
        ? `Full screenplay scene: ${scriptText}. ${ratioTag}, visual style: ${style}, cinematography: ${cameraStyle}, mood: ${mood}.${diffusionBrandTag}`
        : `${prompt}. ${ratioTag}, visual style: ${style}, cinematography: ${cameraStyle}, mood: ${mood}.${diffusionBrandTag}`;

      omniPromise = ai.interactions.create({
        model: 'gemini-omni-1.1-flash',
        input: diffusionInput,
        response_format: {
          type: 'video',
        },
      });
    }

    // 2. Simultaneously generate custom screenplay & storyboard via Gemini Flash
    const directorPrompt = isScript
      ? `You are an expert AI Film Director at Lazan Studios.
Analyze the user's custom video script:
- User's Custom Script: "${scriptText}"
- Visual Style: ${style}
- Camera: ${cameraStyle}
- Mood: ${mood}
- Framing & Aspect Ratio: ${aspectRatio} (${isPortrait ? '9:16 Vertical Portrait framing (subject centered for mobile screen)' : isSquare ? '1:1 Square framing' : '16:9 Widescreen Landscape framing'})
- Target Video Duration: ${durationLabel} (${durationSeconds} seconds)
- Audio Preference: ${isVisualOnly ? 'Visual Directing Only (NO spoken voiceover, background soundtrack only)' : 'Word-for-Word Spoken Voiceover'}${brandDirective}

MANDATORY SCRIPT COMPLETION & DURATION RULES:
1. FULL SCRIPT INTEGRITY: You MUST map and adapt 100% of the user's script from start to finish. Never truncate, cut short, or omit any sentences.
2. DURATION SCENE EXPANSION: The video length is ${durationLabel} (${durationSeconds} seconds). Generate EXACTLY ${targetSceneCount} sequential scenes (Scene 1 to Scene ${targetSceneCount}) spanning the full ${durationSeconds} seconds.
3. SCENE BREAKDOWN:
   - "sceneNumber": 1 to ${targetSceneCount}
   - "timestamp": time range, e.g. "0:00 - 0:15", "0:15 - 0:30", etc.
   - "title": Specific descriptive scene name
   - "shotType": Specific camera shot (e.g. Extreme Wide, Close-Up, Tracking, Hero Orbit)
   - "visualDescription": Highly detailed visual description depicting what is happening in the scene
   - "cameraMovement": Directing camera cue (e.g. "Slow cinematic push-in with shallow focus")
   - "narrationSnippet": ${isVisualOnly ? '""' : 'The exact portion of the user script spoken during this scene window'}

Generate a production director package in pure JSON format:
{
  "title": "Bespoke Catchy Title for this script",
  "synopsis": "Engaging 2-sentence synopsis capturing the complete story arc.",
  "narrationScript": ${isVisualOnly ? '""' : JSON.stringify(scriptText)},
  "scenes": [
    {
      "sceneNumber": 1,
      "timestamp": "0:00 - 0:15",
      "title": "Opening Scene",
      "shotType": "Extreme Wide Shot",
      "visualDescription": "Detailed visual description.",
      "cameraMovement": "Slow push-in",
      "narrationSnippet": ${isVisualOnly ? '""' : '"Corresponding line from the script"'}
    }
  ]
}
Respond with ONLY valid JSON containing all ${targetSceneCount} scenes without markdown code fences.`
      : `You are an expert AI Film Director at Lazan Studios.
Analyze the user's video prompt:
- Prompt: "${prompt}"
- Visual Style: ${style}
- Camera: ${cameraStyle}
- Mood: ${mood}
- Framing & Aspect Ratio: ${aspectRatio} (${isPortrait ? '9:16 Vertical Portrait framing' : isSquare ? '1:1 Square framing' : '16:9 Widescreen Landscape framing'})
- Target Video Duration: ${durationLabel} (${durationSeconds} seconds)${brandDirective}

DURATION & PACING REQUIREMENTS:
1. The requested video length is ${durationLabel} (${durationSeconds} seconds).
2. Generate EXACTLY ${targetSceneCount} sequential scenes (Scene 1 to Scene ${targetSceneCount}) covering the entire story arc from beginning to climax.
3. Write a rich, complete voiceover narration script that spans the full ${durationLabel} duration.

Generate a production director package in pure JSON format:
{
  "title": "Bespoke Catchy Title",
  "synopsis": "Engaging 2-sentence overview of the video narrative.",
  "narrationScript": "Full spoken voiceover script paced across ${durationLabel}.",
  "scenes": [
    {
      "sceneNumber": 1,
      "timestamp": "0:00 - 0:15",
      "title": "Scene Name",
      "shotType": "Extreme Wide Shot",
      "visualDescription": "Detailed visual description.",
      "cameraMovement": "Specific camera instruction",
      "narrationSnippet": "Opening voiceover line"
    }
  ]
}
Respond with ONLY valid JSON containing all ${targetSceneCount} scenes without markdown code fences.`;

    const callDirector = async (): Promise<any> => {
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const m of candidateModels) {
        try {
          const res = await ai.models.generateContent({
            model: m,
            contents: directorPrompt,
          });
          return res;
        } catch (err) {
          console.warn(`[VideoGeneration] Director attempt with ${m} notice:`, err);
        }
      }
      throw new Error('All candidate director models unavailable');
    };

    const directorPromise = callDirector();

    const [omniResult, directorResult] = await Promise.allSettled([
      omniPromise,
      directorPromise,
    ]);

    // Parse Director Results - Initialize with sequential scenes spanning full duration
    let title = isScript
      ? (scriptText.slice(0, 48).trim() || 'Custom Script Creation')
      : (prompt.split(',')[0].slice(0, 48).trim() || 'Untitled AI Creation');
    let synopsis = isScript
      ? `A ${style.toLowerCase()} production based on your custom screenplay.`
      : `A ${style.toLowerCase()} production based on "${prompt}".`;
    let narrationScript = isVisualOnly ? '' : (isScript ? scriptText : 'Every journey begins with a singular vision.');

    let scenes: AIScene[] = generateSequentialScenes(
      scriptText,
      prompt,
      isScript,
      durationSeconds,
      targetSceneCount,
      style,
      cameraStyle,
      isVisualOnly
    );

    if (directorResult.status === 'fulfilled') {
      try {
        const rawText = directorResult.value.text || '';
        const cleaned = rawText.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.title) title = parsed.title;
        if (parsed.synopsis) synopsis = parsed.synopsis;
        if (isVisualOnly) {
          narrationScript = '';
        } else if (isScript) {
          // Guarantee 100% full user script is preserved
          narrationScript = scriptText;
        } else if (parsed.narrationScript) {
          narrationScript = parsed.narrationScript;
        }
        if (Array.isArray(parsed.scenes) && parsed.scenes.length >= 2) {
          scenes = parsed.scenes;
        }
      } catch (parseErr) {
        console.warn('[VideoGeneration] Director JSON parse notice, retaining sequential scenes:', parseErr);
      }
    } else {
      console.warn('[VideoGeneration] Director call note, retaining full sequential scenes:', directorResult.reason);
    }

    // Process Omni Video Render
    let generatedVideoUrl: string | undefined;
    let source: VideoGenerationResult['source'] = 'gemini-director';

    if (omniResult.status === 'fulfilled') {
      const interaction = omniResult.value;
      const outputVideo = (interaction as any)?.output_video;

      if (outputVideo?.data) {
        try {
          if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.atob === 'function') {
            const byteCharacters = window.atob(outputVideo.data);
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([byteNumbers], { type: 'video/mp4' });
            generatedVideoUrl = URL.createObjectURL(blob);
            source = 'google-omni';
            console.log('[VideoGeneration] Generated Web Blob URL for Omni video');
          } else {
            const cacheDir = FileSystem.cacheDirectory || `${FileSystem.documentDirectory || ''}cache/`;
            const localFilePath = `${cacheDir}lazan_omni_${Date.now()}.mp4`;
            await FileSystem.writeAsStringAsync(localFilePath, outputVideo.data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            generatedVideoUrl = localFilePath;
            source = 'google-omni';
            console.log('[VideoGeneration] Successfully rendered and cached Google Omni video to:', localFilePath);
          }
        } catch (writeErr) {
          console.warn('[VideoGeneration] File write fallback, using data URI:', writeErr);
          generatedVideoUrl = `data:video/mp4;base64,${outputVideo.data}`;
          source = 'google-omni';
        }
      }
    } else {
      console.warn('[VideoGeneration] Omni video generation notice:', omniResult.reason);
    }

    return {
      success: true,
      title,
      synopsis,
      narrationScript,
      scenes,
      videoUrl: generatedVideoUrl,
      source,
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.warn('[VideoGeneration] Pipeline fallback notice:', errorMessage);

    const isScript = mode === 'script' && !!customScript?.trim();
    const scriptText = isScript && customScript ? customScript.trim() : '';
    const isVisualOnly = narrationMode === 'visual_only';
    const targetSceneCount = durationSeconds >= 15 ? 3 : durationSeconds >= 10 ? 2 : 1;

    const fallbackScenes = generateSequentialScenes(
      scriptText,
      prompt,
      isScript,
      durationSeconds,
      targetSceneCount,
      style,
      cameraStyle,
      isVisualOnly
    );

    return {
      success: false,
      title: isScript ? (scriptText.slice(0, 36).trim() + '...') : (prompt.split(',')[0].slice(0, 32).trim() || 'Untitled AI Creation'),
      synopsis: isScript ? `A full ${style.toLowerCase()} production based on your custom screenplay.` : `A ${style.toLowerCase()} scene based on "${prompt}".`,
      narrationScript: isVisualOnly ? '' : (isScript ? scriptText : 'In a world shaped by innovation, every frame tells a story.'),
      scenes: fallbackScenes,
      source: 'fallback',
      message: errorMessage,
    };
  }
}
