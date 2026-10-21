export type VoiceGender = 'male' | 'female';
export type VoiceStyle = 'narration' | 'dialogue' | 'none';

export interface VoiceLanguage {
  id: string;
  name: string;
  flag: string;
  sampleName: string;
}

export const VOICE_LANGUAGES: VoiceLanguage[] = [
  { id: 'en-us', name: 'US English', flag: '🇺🇸', sampleName: 'Marcus / Sarah' },
  { id: 'en-ng', name: 'Nigerian English', flag: '🇳🇬', sampleName: 'Chidi / Amaka' },
  { id: 'en-uk', name: 'UK English', flag: '🇬🇧', sampleName: 'Arthur / Olivia' },
  { id: 'en-af', name: 'African English', flag: '🌍', sampleName: 'Kofi / Zola' },
  { id: 'en-global', name: 'English (Neutral)', flag: '🌐', sampleName: 'Leo / Maya' },
];

export const VOICE_STYLES = [
  {
    id: 'narration' as VoiceStyle,
    name: 'Narration',
    description: 'Smooth, cinematic storytelling voice-over',
    icon: 'mic-outline',
  },
  {
    id: 'dialogue' as VoiceStyle,
    name: 'Character Dialogue',
    description: 'Conversational acting tone matching scene actors',
    icon: 'chatbubbles-outline',
  },
  {
    id: 'none' as VoiceStyle,
    name: 'No Voice',
    description: 'Pure visual with background score & sound FX',
    icon: 'volume-mute-outline',
  },
];
