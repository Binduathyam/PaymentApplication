import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

export const startRecording = async () => {
  try {
    await Audio.requestPermissionsAsync();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    await recording.startAsync();
    console.log("Recording started");
  } catch (error) {
    console.log("Start recording error:", error);
  }
};

export const stopRecording = async (): Promise<string | null> => {
  try {
    if (!recording) return null;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording stopped:", uri);

    recording = null;
    return uri;
  } catch (error) {
    console.log("Stop recording error:", error);
    return null;
  }
};

export const sendToBackend = async (uri: string) => {
  const formData = new FormData();

  formData.append('audio', {
    uri,
    name: 'speech.m4a',
    type: 'audio/m4a',
  } as any);

  const response = await fetch('http://172.23.4.188:5000/stt', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = await response.json();
  return data.text;
};
