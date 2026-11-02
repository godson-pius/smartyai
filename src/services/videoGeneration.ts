import { GoogleGenAI } from '@google/genai';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

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
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number;
  resolution?: '720p' | '1080p' | '4k';
  mood?: string;
  cameraStyle?: string;
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
    durationSeconds = 60,
    mood = 'Inspiring',
    cameraStyle = 'Cinematic tracking shot',
  } = params;

  try {
    const ai = getGenAIClient();
    const isScript = mode === 'script' && !!customScript?.trim();
    const scriptText = isScript && customScript ? customScript.trim() : '';
    const isVisualOnly = narrationMode === 'visual_only';
    const targetSceneCount = durationSeconds >= 120 ? 8 : durationSeconds >= 60 ? 5 : 3;
    const durationLabel = durationSeconds >= 120 ? '2 minutes' : durationSeconds >= 60 ? '1 minute' : '20 seconds';

    // 1. Kick off real Gemini Omni 1.1 Flash Video Generation
    const diffusionInput = isScript
      ? `${scriptText.slice(0, 320)}, visual style: ${style}, cinematography: ${cameraStyle}, mood: ${mood}`
      : `${prompt}, visual style: ${style}, cinematography: ${cameraStyle}, mood: ${mood}`;

    const omniPromise = ai.interactions.create({
      model: 'gemini-omni-1.1-flash',
      input: diffusionInput,
      response_format: {
        type: 'video',
      },
    });

    // 2. Simultaneously generate custom screenplay & storyboard via Gemini 3.8 Flash
    const directorPrompt = isScript
      ? `You are an expert AI Film Director at Lazan Studios.
Analyze the user's custom video script:
- User's Custom Script: "${scriptText}"
- Visual Style: ${style}
- Camera: ${cameraStyle}
- Mood: ${mood}
- Target Video Duration: ${durationLabel} (${durationSeconds} seconds)
- Audio Preference: ${isVisualOnly ? 'Visual Directing Only (NO spoken voiceover, background soundtrack only)' : 'Word-for-Word Spoken Voiceover'}

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
- Target Video Duration: ${durationLabel} (${durationSeconds} seconds)

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

    const directorPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: directorPrompt,
    });

    const [omniResult, directorResult] = await Promise.allSettled([
      omniPromise,
      directorPromise,
    ]);

    // Parse Director Results
    let title = isScript
      ? (scriptText.slice(0, 48).trim() || 'Custom Script Creation')
      : (prompt.split(',')[0].slice(0, 48).trim() || 'Untitled AI Creation');
    let synopsis = isScript
      ? `A ${style.toLowerCase()} production based on your custom screenplay.`
      : `A ${style.toLowerCase()} production based on "${prompt}".`;
    // For custom scripts with voiceover, ALWAYS preserve the full, untruncated user script
    let narrationScript = isVisualOnly ? '' : (isScript ? scriptText : 'Every journey begins with a singular vision.');
    let scenes: AIScene[] = [
      {
        sceneNumber: 1,
        timestamp: '0:00 - 0:15',
        title: 'Opening Scene',
        shotType: 'Establishing Shot',
        visualDescription: isScript ? scriptText.slice(0, 140) : prompt,
        cameraMovement: cameraStyle,
        narrationSnippet: isVisualOnly ? '' : (isScript ? scriptText.slice(0, 80) : 'Every visionary moment begins with light.'),
      },
    ];

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
        if (Array.isArray(parsed.scenes) && parsed.scenes.length > 0) scenes = parsed.scenes;
      } catch {
        // use defaults
      }
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

    return {
      success: false,
      title: prompt.split(',')[0].slice(0, 32).trim() || 'Untitled AI Creation',
      synopsis: `A ${style.toLowerCase()} scene based on "${prompt}".`,
      narrationScript: 'In a world shaped by innovation, every frame tells a story.',
      scenes: [
        {
          sceneNumber: 1,
          title: 'Opening Scene',
          shotType: 'Establishing Shot',
          visualDescription: prompt,
          cameraMovement: cameraStyle,
          narrationSnippet: 'Every visionary moment begins with light.',
        },
      ],
      source: 'fallback',
      message: errorMessage,
    };
  }
}
