import * as Speech from 'expo-speech';

export const speak = (text: string) => {
  Speech.stop(); // stop previous speech
  Speech.speak(text, {
    language: "en-US",
    pitch: 1,
    rate: 0.9,
  });
};
