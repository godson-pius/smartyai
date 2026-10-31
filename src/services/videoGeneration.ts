import { GoogleGenAI } from '@google/genai';

export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY

// Singleton Google GenAI client
let aiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
  }
  return aiClient;
}

export interface VideoGenerationParams {
  prompt: string;
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number;
  resolution?: '720p' | '1080p' | '4k';
  onProgress?: (stage: string, percent: number) => void;
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  source: 'google-omni' | 'preview-engine';
  message?: string;
}

/**
 * Generates an AI video using Google's generative video model (gemini-omni-1.1-flash / Veo successor).
 * Handles API key authentication, aspect ratio, duration, and graceful fallback if Free Tier rate limits apply.
 */
export async function generateAIVideo(
  params: VideoGenerationParams
): Promise<VideoGenerationResult> {
  const { prompt, aspectRatio = '16:9', resolution = '1080p', durationSeconds = 60 } = params;

  // Video duration for Omni Flash is between 3 and 10 seconds per scene
  const omniDuration = Math.min(Math.max(Math.round(durationSeconds / 6), 3), 10);
  const targetResolution = resolution === '4k' ? '1080p' : resolution;

  try {
    const ai = getGenAIClient();

    // Call Google's video model via the official Interactions API
    const interaction = await ai.interactions.create({
      model: 'gemini-omni-1.1-flash',
      input: [
        {
          type: 'text',
          text: prompt,
        },
      ],
      response_format: {
        type: 'video',
        delivery: 'uri',
        aspect_ratio: aspectRatio,
        resolution: targetResolution,
        duration: omniDuration,
      },
    });

    const outputVideo = (interaction as any)?.output_video;
    if (outputVideo && outputVideo.uri) {
      return {
        success: true,
        videoUrl: outputVideo.uri,
        source: 'google-omni',
      };
    }

    return {
      success: false,
      source: 'preview-engine',
      message: 'No video URI returned from model',
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.warn('[VideoGeneration] Google Video Model notice:', errorMessage);

    // Return detailed error diagnostics for rate limits / quota
    return {
      success: false,
      source: 'preview-engine',
      message: errorMessage,
    };
  }
}
